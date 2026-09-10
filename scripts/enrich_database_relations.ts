import Database from 'better-sqlite3';
// @ts-expect-error wink-lemmatizer lacks types
import lemmatize from 'wink-lemmatizer';
import path from 'path';
import { CONTRACTIONS } from '../lib/morphology';
import { ENGLISH_PHONETICS_MAP } from '../lib/english_phonetics';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
console.log(`[ENRICH] Opening SQLite database at ${dbPath}...`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Build word index for fast lookup
console.log('[ENRICH] Loading words table index...');
const words = db.prepare('SELECT id, word, lang_code FROM words').all() as { id: number; word: string; lang_code: string }[];
const wordMap = new Map<string, number>(); // "lang_code:lowercase_word" -> id

for (const w of words) {
    wordMap.set(`${w.lang_code}:${w.word.toLowerCase()}`, w.id);
}
console.log(`[ENRICH] Indexed ${words.length} words.`);

// Set of all pending relations: "word_id|related_word|relation_type"
const pendingRelations = new Set<string>();

function addRelation(wordId: number, relatedWord: unknown, relationType: string) {
    if (!relatedWord) return;
    const cleanRelWord = String(relatedWord).trim().replace(/^['"‘“]+/, '').replace(/['"’”\.\,\;\:\!\?]+$/, '').trim();
    if (!cleanRelWord || cleanRelWord.length === 0 || cleanRelWord.length > 60) return;
    pendingRelations.add(`${wordId}|${cleanRelWord}|${relationType}`);
}

// 2. Scan all definitions
console.log('[ENRICH] Scanning definitions for root and inflection patterns...');
const defRows = db.prepare(`
    SELECT w.id as word_id, w.word, w.lang_code, d.definition
    FROM definitions d
    JOIN word_definitions wd ON d.id = wd.definition_id
    JOIN words w ON wd.word_id = w.id
`).all() as { word_id: number; word: string; lang_code: string; definition: string | null }[];

const patterns = [
    // Quá khứ / phân từ
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*(?:thơ\s+ca|thân\s+mật|tiếng\s+lóng|cũ|hiếm|thông\s+tục)?\s*(?:dạng\s+|động\s+từ\s+)?(quá\s+khứ(?:\s+đơn)?(?:\s+và\s+phân\s+từ\s+quá\s+khứ)?|phân\s+từ(?:\s+quá\s+khứ|\s+hai|\s+hiện\s+tại)?|thì\s+quá\s+khứ|danh\s+động\s+từ|hiện\s+tại\s+phân\s+từ)\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // Số nhiều
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*(?:dạng\s+)?số\s+nhiều\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // Ngôi thứ ba số ít
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*(?:động\s+từ\s+chia\s+ở\s+)?ngôi\s+thứ\s+ba(?:\s+số\s+ít)?\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // So sánh hơn / nhất
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*so\s+sánh\s+(?:hơn|nhất)\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // Dạng viết tắt / rút gọn
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*(?:dạng\s+|từ\s+)?viết\s+tắt\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // Dạng thay thế / viết khác
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:\([^\)]+\)\s*)*dạng\s+(?:thay\s+thế|viết\s+khác)\s+của\s+([^\.,;:\(\)\[\]\n\r]+)/i },
    // English Wiktionary meta patterns
    { type: 'g', label: 'Gốc từ', reg: /^\s*(?:past\s+tense|past\s+participle|plural|third-person\s+singular|present\s+participle|comparative|superlative|gerund|alternative\s+spelling|abbreviation)\s+of\s+([^\.,;:\(\)\[\]\n\r]+)/i }
];

let defMatchCount = 0;

for (const r of defRows) {
    if (!r.definition) continue;
    for (const p of patterns) {
        const m = r.definition.match(p.reg);
        if (m) {
            const rawTarget = (m[2] || m[1]).trim();
            const cleanTarget = rawTarget.replace(/^['"‘“]+/, '').replace(/['"’”\.\,\;\:\!\?]+$/, '').trim();
            if (cleanTarget && cleanTarget.toLowerCase() !== r.word.toLowerCase() && cleanTarget.length <= 60) {
                defMatchCount++;
                // 1. Forward relation: word -> target (Gốc từ)
                addRelation(r.word_id, cleanTarget, 'g');

                // 2. Reverse relation: target -> word (Từ phái sinh) if target exists in words table
                const targetId = wordMap.get(`${r.lang_code}:${cleanTarget.toLowerCase()}`);
                if (targetId) {
                    addRelation(targetId, r.word, 'd');
                }
            }
            break;
        }
    }
}
console.log(`[ENRICH] Definition scan completed. Matched ${defMatchCount} definitions.`);

// 3. Morphological lemmatizer scan for all English words
console.log('[ENRICH] Scanning English words with lemmatizer & irregular mappings...');
const VERB_PRIORITY: Record<string, string> = {
    'went': 'go',
    'gone': 'go',
    'goes': 'go',
    'going': 'go',
    'ate': 'eat',
    'eaten': 'eat',
    'eating': 'eat',
    'eats': 'eat',
    'ran': 'run',
    'running': 'run',
    'runs': 'run',
    'did': 'do',
    'done': 'do',
    'does': 'do',
    'doing': 'do',
    'had': 'have',
    'has': 'have',
    'having': 'have',
    'was': 'be',
    'were': 'be',
    'been': 'be',
    'being': 'be',
    'am': 'be',
    'is': 'be',
    'are': 'be',
    'said': 'say',
    'saying': 'say',
    'says': 'say',
    'made': 'make',
    'making': 'make',
    'makes': 'make',
    'got': 'get',
    'gotten': 'get',
    'getting': 'get',
    'gets': 'get',
    'took': 'take',
    'taken': 'take',
    'taking': 'take',
    'takes': 'take',
    'came': 'come',
    'coming': 'come',
    'comes': 'come',
    'saw': 'see',
    'seen': 'see',
    'seeing': 'see',
    'sees': 'see',
    'knew': 'know',
    'known': 'know',
    'knowing': 'know',
    'knows': 'know',
    'thought': 'think',
    'thinking': 'think',
    'thinks': 'think',
    'gave': 'give',
    'given': 'give',
    'giving': 'give',
    'gives': 'give',
    'found': 'find',
    'finding': 'find',
    'finds': 'find',
    'told': 'tell',
    'telling': 'tell',
    'tells': 'tell',
    'became': 'become',
    'becoming': 'become',
    'becomes': 'become',
    'left': 'leave',
    'leaving': 'leave',
    'leaves': 'leave',
    'felt': 'feel',
    'feeling': 'feel',
    'feels': 'feel',
    'brought': 'bring',
    'bringing': 'bring',
    'brings': 'bring',
    'began': 'begin',
    'begun': 'begin',
    'beginning': 'begin',
    'begins': 'begin',
    'kept': 'keep',
    'keeping': 'keep',
    'keeps': 'keep',
    'held': 'hold',
    'holding': 'hold',
    'holds': 'hold',
    'wrote': 'write',
    'written': 'write',
    'writing': 'write',
    'writes': 'write',
    'stood': 'stand',
    'standing': 'stand',
    'stands': 'stand',
    'heard': 'hear',
    'hearing': 'hear',
    'hears': 'hear',
    'let': 'let',
    'meant': 'mean',
    'meaning': 'mean',
    'means': 'mean',
    'set': 'set',
    'met': 'meet',
    'meeting': 'meet',
    'meets': 'meet',
    'children': 'child',
    'mice': 'mouse',
    'teeth': 'tooth',
    'feet': 'foot',
    'geese': 'goose',
    'oxen': 'ox',
    'better': 'good',
    'best': 'good',
    'worse': 'bad',
    'worst': 'bad',
    'more': 'much',
    'most': 'much',
    'less': 'little',
    'least': 'little'
};

for (const w of words) {
    if (w.lang_code !== 'en') continue;
    const lower = w.word.toLowerCase();
    if (lower.length <= 2) continue;

    const lemmas = new Set<string>();

    if (VERB_PRIORITY[lower] && VERB_PRIORITY[lower] !== lower) {
        lemmas.add(VERB_PRIORITY[lower]);
    }

    if (/^[a-z]+$/.test(lower)) {
        const vLemma = lemmatize.verb(lower);
        const nLemma = lemmatize.noun(lower);
        const aLemma = lemmatize.adjective(lower);

        if (vLemma && vLemma !== lower) lemmas.add(vLemma);
        if (nLemma && nLemma !== lower && !VERB_PRIORITY[lower]) lemmas.add(nLemma);
        if (aLemma && aLemma !== lower) lemmas.add(aLemma);
    }

    for (const lem of lemmas) {
        addRelation(w.id, lem, 'g');
        const targetId = wordMap.get(`en:${lem}`);
        if (targetId) {
            addRelation(targetId, w.word, 'd');
        }
    }
}
console.log(`[ENRICH] Lemmatizer scan completed.`);

// 4. Contractions
console.log('[ENRICH] Adding contractions relations...');
for (const [contraction, info] of Object.entries(CONTRACTIONS)) {
    const contId = wordMap.get(`en:${contraction.toLowerCase()}`);
    if (contId) {
        addRelation(contId, info.baseWord, 'g');
        const baseId = wordMap.get(`en:${info.baseWord.toLowerCase()}`);
        if (baseId) {
            addRelation(baseId, contraction, 'd');
        }
    }
}

// 5. Batch insert pending relations
console.log(`[ENRICH] Total unique relations to insert/verify: ${pendingRelations.size}...`);
const insertRelStmt = db.prepare(`
    INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type)
    VALUES (?, ?, ?)
`);

let insertedRelCount = 0;
const runInsertRelations = db.transaction((relationsList: string[]) => {
    for (const item of relationsList) {
        const [wordIdStr, relatedWord, relType] = item.split('|');
        const wordId = parseInt(wordIdStr, 10);
        const info = insertRelStmt.run(wordId, relatedWord, relType);
        if (info.changes > 0) {
            insertedRelCount++;
        }
    }
});

const relationsArray = Array.from(pendingRelations);
const CHUNK_SIZE = 5000;
for (let i = 0; i < relationsArray.length; i += CHUNK_SIZE) {
    const chunk = relationsArray.slice(i, i + CHUNK_SIZE);
    runInsertRelations(chunk);
    console.log(`[ENRICH] Progress: ${Math.min(i + CHUNK_SIZE, relationsArray.length)} / ${relationsArray.length} (New inserted: ${insertedRelCount})`);
}
console.log(`[ENRICH] Finished inserting relations. Total new rows inserted: ${insertedRelCount}.`);

// 6. Missing pronunciations from ENGLISH_PHONETICS_MAP
console.log('[ENRICH] Adding missing pronunciations from ENGLISH_PHONETICS_MAP...');
const insertPronStmt = db.prepare(`
    INSERT OR IGNORE INTO pronunciations (word_id, ipa, region)
    VALUES (?, ?, ?)
`);

let insertedPronCount = 0;
const runInsertPronunciations = db.transaction(() => {
    for (const [word, prons] of Object.entries(ENGLISH_PHONETICS_MAP)) {
        const wordId = wordMap.get(`en:${word.toLowerCase()}`);
        if (wordId) {
            for (const p of prons) {
                const info = insertPronStmt.run(wordId, p.ipa, p.region);
                if (info.changes > 0) {
                    insertedPronCount++;
                }
            }
        }
    }
});
runInsertPronunciations();
console.log(`[ENRICH] Finished inserting pronunciations. Total new pronunciations: ${insertedPronCount}.`);

// 7. Verify counts in DB
const totalRelsNow = db.prepare('SELECT count(*) as c FROM word_relations').get() as { c: number };
const totalGNow = db.prepare("SELECT count(*) as c FROM word_relations WHERE relation_type = 'g'").get() as { c: number };
const totalDNow = db.prepare("SELECT count(*) as c FROM word_relations WHERE relation_type = 'd'").get() as { c: number };
const totalPronsNow = db.prepare('SELECT count(*) as c FROM pronunciations').get() as { c: number };

console.log('[ENRICH] === DATABASE SUMMARY AFTER ENRICHMENT ===');
console.log(`Total relations: ${totalRelsNow.c}`);
console.log(`- 'g' (Gốc từ): ${totalGNow.c}`);
console.log(`- 'd' (Từ phái sinh): ${totalDNow.c}`);
console.log(`Total pronunciations: ${totalPronsNow.c}`);

db.close();
console.log('[ENRICH] Database closed successfully.');
