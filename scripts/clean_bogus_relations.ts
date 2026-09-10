import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
console.log(`[CLEANUP] Opening database at ${dbPath}...`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Sửa từ 'thi' tiếng Anh (id: 210792) thành 'thy'
const updateThy = db.prepare("UPDATE words SET word = 'thy' WHERE id = 210792 AND lang_code = 'en' AND word = 'thi'").run();
console.log(`[CLEANUP] Updated 'thi' -> 'thy': ${updateThy.changes} row(s).`);

// 2. Danh sách các từ gốc tiếng Anh tuyệt đối KHÔNG có Gốc từ (Base words / Closed-class words)
const BASE_WORDS = new Set([
    // Pronouns, determiners, conjunctions, prepositions
    'this', 'that', 'these', 'those', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'because', 'as', 
    'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'yes', 
    'us', 'his', 'its', 'her', 'our', 'their', 'my', 'your', 'shall', 'may', 'might', 'must',

    // Family & People
    'mother', 'father', 'brother', 'sister', 'uncle', 'aunt', 'cousin', 'nephew', 'niece',

    // Nature & Seasons
    'flower', 'shower', 'tower', 'summer', 'winter', 'autumn', 'spring', 'water', 'river', 'silver',
    'copper', 'weather', 'thunder', 'timber', 'amber', 'spider', 'tiger', 'lobster', 'otter', 'beaver',
    'badger', 'vulture', 'pasture',

    // Household, Food & Everyday objects
    'butter', 'batter', 'bitter', 'dinner', 'finger', 'corner', 'letter', 'matter', 'latter',
    'paper', 'power', 'number', 'member', 'border', 'order', 'monster', 'master', 'soldier',
    'doctor', 'factor', 'sector', 'major', 'minor', 'mirror', 'terror', 'horror', 'honor',
    'error', 'flavor', 'color', 'labor', 'author', 'motor', 'liquor', 'harbor', 'vapor',
    'anchor', 'sensor', 'pastor', 'tenor', 'vigor', 'armor',

    // Adverbs / Adjectives with -ly that are base words
    'early', 'only', 'daily', 'ugly', 'holy', 'silly', 'lonely', 'friendly', 'lovely', 'lively',
    'orderly', 'timely', 'costly', 'deadly', 'likely', 'unlikely', 'belly', 'jelly', 'ally', 'rally',
    'apply', 'reply', 'supply', 'imply', 'comply', 'rely',

    // Common words with in- / im- that are NOT prefixes
    'image', 'imago', 'impact', 'import', 'income', 'index', 'infant', 'infra', 'inlet', 'inbox',
    'input', 'insect', 'inside', 'insight', 'instance', 'instant', 'instead', 'instrument', 'insult',
    'intact', 'intel', 'intend', 'intent', 'interest', 'interim', 'intern', 'interview', 'into',
    'invest', 'invent', 'invite', 'invoice', 'involve', 'incur', 'ingot', 'ink', 'inked',

    // Common words with dis- that are NOT prefixes
    'disease', 'discuss', 'distant', 'distil', 'distort', 'disturb', 'discourse', 'dismay', 'display',
    'discover', 'disaster', 'disk', 'dish',

    // Common words with re- that are NOT prefixes
    'reach', 'read', 'ready', 'real', 'really', 'reason', 'remain', 'remedy', 'remember', 'remind',
    'remote', 'remove', 'render', 'rent', 'repair', 'repeat', 'repent', 'report', 'rescue', 'research',
    'resemble', 'resent', 'reserve', 'reset', 'reside', 'resign', 'resist', 'resolve', 'resort',
    'resource', 'respect', 'respond', 'response', 'rest', 'restaurant', 'result', 'resume', 'retail',
    'retain', 'retire', 'return', 'reveal', 'revenue', 'reverse', 'review', 'reward', 'refuse',

    // Words with un- that are NOT prefixes
    'uncle', 'unit', 'union', 'under', 'until', 'unless',

    // Base words ending in -s that are not plurals
    'gas', 'bus', 'plus', 'thus', 'lens', 'chaos', 'cosmos', 'status', 'virus', 'focus', 'basis',
    'crisis', 'thesis', 'analysis', 'axis', 'canvas', 'mars', 'paris', 'series', 'species', 'corps',
    'debris', 'chassis', 'walrus', 'octopus', 'platypus', 'circus', 'fetus', 'genus', 'sinus',
    'bonus', 'minus', 'chorus', 'cactus', 'fungus', 'radius', 'stimulus', 'syllabus', 'alumnus',
    'terminus', 'oasis', 'diagnosis', 'prognosis', 'synopsis', 'parenthesis', 'paralysis',
    'neurosis', 'psychosis', 'bison', 'news', 'amends', 'barracks', 'billiards', 'scissors', 'trousers',
    'panties', 'measles', 'mumps', 'rickets', 'shingles', 'customs', 'premises',

    // Base words ending in -ment, -tion
    'moment', 'element', 'comment', 'document', 'segment', 'garment', 'pigment', 'monument',
    'nation', 'station', 'motion', 'portion', 'section', 'fraction', 'suction', 'caption', 'option',
    'mention', 'question'
]);

// Lấy toàn bộ quan hệ Gốc từ ('g')
console.log('[CLEANUP] Scanning word_relations for false stems...');
const gRels = db.prepare(`
    SELECT wr.id, wr.word_id, w.word, wr.related_word 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE wr.relation_type = 'g' AND w.lang_code = 'en'
`).all() as { id: number; word_id: number; word: string; related_word: string }[];

console.log(`[CLEANUP] Found ${gRels.length} 'g' relations for English words.`);

const idsToDelete = new Set<number>();
const reciprocalToDelete = new Set<string>(); // key: `${rootId}_${word}_d`

// Cache word -> id
const wordMap = new Map<string, number>();
const allWords = db.prepare("SELECT id, word FROM words WHERE lang_code = 'en'").all() as { id: number; word: string }[];
for (const row of allWords) {
    wordMap.set(row.word.toLowerCase(), row.id);
}

for (const r of gRels) {
    const w = r.word.toLowerCase();
    const root = r.related_word.toLowerCase();

    let isInvalid = false;

    // 1. Trùng từ hoặc quá ngắn (< 3 ký tự và không phải be, do, go...)
    if (w === root) {
        isInvalid = true;
    } else if (root.length < 3 && !['be', 'do', 'go', 'am', 'is', 'ox', 'he', 'we', 'me'].includes(root)) {
        isInvalid = true;
    }
    // 2. Thuộc danh sách từ gốc cơ bản (BASE_WORDS) hoặc từ có độ dài <= 1
    else if (BASE_WORDS.has(w) || w.length <= 1) {
        isInvalid = true;
    }
    // 3. Từ liên quan tới 'thi' hoặc 'thy' (trừ thine -> thy)
    else if ((root === 'thi' || root === 'thy') && w !== 'thine') {
        isInvalid = true;
    }
    // 3.1. Từ 'the' có gốc từ là 'te'
    else if (w === 'the' && root === 'te') {
        isInvalid = true;
    }
    // 4. Lỗi cắt tiền tố re- thành dạng vô nghĩa hoặc sai nghĩa (e.g. reached -> ached, requests -> quests, reviewed -> viewed)
    else if (w.startsWith('re') && w.slice(2) === root) {
        if (['reached', 'reaches', 'reaching', 'reactor', 'reactions', 'reaction', 'requests', 'reviewed', 'relative', 'religion'].includes(w)) {
            isInvalid = true;
        }
    }
    // 5. Cắt đuôi -ly sai cho các từ không phải tính từ -> trạng từ (early -> ear, apply -> app...)
    else if (w.endsWith('ly') && (w.slice(0, -2) === root || w.slice(0, -3) + 'y' === root)) {
        if (['early', 'apply', 'reply', 'supply', 'imply', 'comply', 'belly', 'jelly', 'ugly', 'only', 'daily'].includes(w)) {
            isInvalid = true;
        }
    }
    // 6. Cắt đuôi -er/-or sai cho các từ không phải động từ -> danh từ chỉ người/vật (mother -> moth, brother -> broth...)
    else if ((w.endsWith('er') || w.endsWith('or')) && BASE_WORDS.has(w)) {
        isInvalid = true;
    }
    // 7. Cắt tiền tố im-/in- sai (image -> age, ingot -> got, incur -> cur...)
    else if ((w.startsWith('im') || w.startsWith('in')) && (w.slice(2) === root)) {
        if (['image', 'imago', 'incur', 'ingot', 'inked', 'inbye', 'incog', 'injun', 'impli', 'impot', 'distad', 'distil', 'dismay', 'disuse'].includes(w)) {
            isInvalid = true;
        }
    }

    if (isInvalid) {
        idsToDelete.add(r.id);
        const rootId = wordMap.get(root);
        if (rootId) {
            reciprocalToDelete.add(`${rootId}_${w}`);
        }
    }
}

console.log(`[CLEANUP] Identified ${idsToDelete.size} invalid 'g' relations to delete.`);

// Xóa các quan hệ 'g'
const deleteStmt = db.prepare('DELETE FROM word_relations WHERE id = ?');
const deleteReciprocalStmt = db.prepare("DELETE FROM word_relations WHERE word_id = ? AND related_word = ? AND relation_type = 'd'");

const cleanupTransaction = db.transaction(() => {
    let countG = 0;
    for (const id of idsToDelete) {
        deleteStmt.run(id);
        countG++;
    }

    let countD = 0;
    for (const key of reciprocalToDelete) {
        const [rootIdStr, w] = key.split('_');
        const res = deleteReciprocalStmt.run(Number(rootIdStr), w);
        countD += res.changes;
    }

    // Đảm bảo quan hệ đúng cho reached, reaches, reaching -> reach
    const reachId = wordMap.get('reach');
    if (reachId) {
        const insertG = db.prepare("INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, 'reach', 'g')");
        const insertD = db.prepare("INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, 'd')");
        for (const form of ['reached', 'reaches', 'reaching']) {
            const formId = wordMap.get(form);
            if (formId) {
                insertG.run(formId);
                insertD.run(reachId, form);
            }
        }
    }

    console.log(`[CLEANUP] Deleted ${countG} 'g' relations and ${countD} reciprocal 'd' relations.`);
});

cleanupTransaction();

console.log('[CHECKPOINT] Checkpointing WAL...');
db.pragma('wal_checkpoint(TRUNCATE)');
console.log('[CLEANUP] Done successfully!');
