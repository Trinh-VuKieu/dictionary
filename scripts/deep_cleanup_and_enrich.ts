import Database from 'better-sqlite3';
import path from 'path';
// @ts-expect-error wink-lemmatizer lacks types
import lemmatize from 'wink-lemmatizer';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
console.log(`[CLEANUP] Opening database at ${dbPath}...`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Clean up orphaned records
console.log('[CLEANUP] Removing orphaned records across all tables...');
const delOrphanWordDefs = db.prepare('DELETE FROM word_definitions WHERE word_id NOT IN (SELECT id FROM words)').run();
const delOrphanProns = db.prepare('DELETE FROM pronunciations WHERE word_id NOT IN (SELECT id FROM words)').run();
const delOrphanTrans = db.prepare('DELETE FROM translations WHERE word_id NOT IN (SELECT id FROM words)').run();
const delOrphanRels = db.prepare('DELETE FROM word_relations WHERE word_id NOT IN (SELECT id FROM words)').run();
console.log(`Deleted orphaned: ${delOrphanWordDefs.changes} word_definitions, ${delOrphanProns.changes} pronunciations, ${delOrphanTrans.changes} translations, ${delOrphanRels.changes} word_relations.`);

// 2. Remove self-referencing relations (word relates to itself)
console.log('[CLEANUP] Removing self-referencing relations...');
const delSelfRels = db.prepare(`
    DELETE FROM word_relations
    WHERE id IN (
        SELECT wr.id
        FROM word_relations wr
        JOIN words w ON wr.word_id = w.id
        WHERE lower(trim(wr.related_word)) = lower(trim(w.word))
    )
`).run();
console.log(`Deleted ${delSelfRels.changes} self-referencing relations.`);

// 3. Remove corrupted or single dot definitions
console.log('[CLEANUP] Removing empty or single dot definitions...');
const corruptDefs = db.prepare(`
    SELECT id FROM definitions
    WHERE trim(definition) = '' OR definition = '.' OR definition = '-' OR definition IS NULL
`).all() as { id: number }[];

if (corruptDefs.length > 0) {
    const corruptIds = corruptDefs.map(d => d.id).join(',');
    db.prepare(`DELETE FROM word_definitions WHERE definition_id IN (${corruptIds})`).run();
    db.prepare(`DELETE FROM definitions WHERE id IN (${corruptIds})`).run();
    console.log(`Deleted ${corruptDefs.length} corrupted definitions.`);
}

// 4. Capture remaining gerund/participle patterns: "Dạng phân từ hiện tại và danh động từ (gerund) của X"
console.log('[ENRICH] Capturing additional inflection definitions...');
const additionalDefRows = db.prepare(`
    SELECT w.id as word_id, w.word, w.lang_code, d.definition
    FROM definitions d
    JOIN word_definitions wd ON d.id = wd.definition_id
    JOIN words w ON wd.word_id = w.id
    WHERE d.definition LIKE '%của%'
`).all() as { word_id: number; word: string; lang_code: string; definition: string }[];

const extraPattern = /của\s+([a-zA-Z\s\-']+)/i;
const insertRelStmt = db.prepare('INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, ?)');
const getWordIdStmt = db.prepare('SELECT id FROM words WHERE word = ? AND lang_code = ?');

let extraCount = 0;
const runExtraRels = db.transaction(() => {
    for (const r of additionalDefRows) {
        if (/dạng\s+phân\s+từ\s+hiện\s+tại\s+và\s+danh\s+động\s+từ/i.test(r.definition)) {
            const m = r.definition.match(extraPattern);
            if (m) {
                const target = m[1].replace(/[\.\,\;\:\!\?\'\"]+$/, '').trim();
                if (target && target.toLowerCase() !== r.word.toLowerCase()) {
                    insertRelStmt.run(r.word_id, target, 'g');
                    const targetRow = getWordIdStmt.get(target.toLowerCase(), r.lang_code) as { id: number } | undefined;
                    if (targetRow) {
                        insertRelStmt.run(targetRow.id, r.word, 'd');
                    }
                    extraCount++;
                }
            }
        }
    }
});
runExtraRels();
console.log(`Added ${extraCount} extra gerund/participle relations.`);

// 5. Add missing irregular verb forms directly into words table
console.log('[ENRICH] Adding missing English irregular verb forms into words table...');
const IRREGULAR_MAPPINGS: [string, string, string, string][] = [
    // [inflected_word, root_verb, grammatical_role, ipa]
    ['ran', 'run', 'Dạng quá khứ đơn của run.', '/ræn/'],
    ['written', 'write', 'Dạng phân từ quá khứ của write.', '/ˈrɪt.ən/'],
    ['made', 'make', 'Dạng quá khứ đơn và phân từ quá khứ của make.', '/meɪd/'],
    ['came', 'come', 'Dạng quá khứ đơn của come.', '/keɪm/'],
    ['drove', 'drive', 'Dạng quá khứ đơn của drive.', '/droʊv/'],
    ['felt', 'feel', 'Dạng quá khứ đơn và phân từ quá khứ của feel.', '/fɛlt/'],
    ['found', 'find', 'Dạng quá khứ đơn và phân từ quá khứ của find.', '/faʊnd/'],
    ['spoke', 'speak', 'Dạng quá khứ đơn của speak.', '/spoʊk/'],
    ['flown', 'fly', 'Dạng phân từ quá khứ của fly.', '/floʊn/'],
    ['born', 'bear', 'Dạng phân từ quá khứ của bear (sinh ra).', '/bɔːrn/'],
    ['bore', 'bear', 'Dạng quá khứ đơn của bear.', '/bɔːr/'],
    ['stole', 'steal', 'Dạng quá khứ đơn của steal.', '/stoʊl/'],
    ['tore', 'tear', 'Dạng quá khứ đơn của tear.', '/tɔːr/'],
    ['worn', 'wear', 'Dạng phân từ quá khứ của wear.', '/wɔːrn/'],
    ['rose', 'rise', 'Dạng quá khứ đơn của rise.', '/roʊz/'],
    ['spent', 'spend', 'Dạng quá khứ đơn và phân từ quá khứ của spend.', '/spɛnt/'],
    ['built', 'build', 'Dạng quá khứ đơn và phân từ quá khứ của build.', '/bɪlt/'],
    ['held', 'hold', 'Dạng quá khứ đơn và phân từ quá khứ của hold.', '/hɛld/'],
    ['stood', 'stand', 'Dạng quá khứ đơn và phân từ quá khứ của stand.', '/stʊd/'],
    ['left', 'leave', 'Dạng quá khứ đơn và phân từ quá khứ của leave.', '/lɛft/'],
    ['lent', 'lend', 'Dạng quá khứ đơn và phân từ quá khứ của lend.', '/lɛnt/'],
    ['blew', 'blow', 'Dạng quá khứ đơn của blow.', '/bluː/'],
    ['dug', 'dig', 'Dạng quá khứ đơn và phân từ quá khứ của dig.', '/dʌɡ/'],
    ['fed', 'feed', 'Dạng quá khứ đơn và phân từ quá khứ của feed.', '/fɛd/'],
    ['hid', 'hide', 'Dạng quá khứ đơn của hide.', '/hɪd/'],
    ['laid', 'lay', 'Dạng quá khứ đơn và phân từ quá khứ của lay.', '/leɪd/'],
    ['led', 'lead', 'Dạng quá khứ đơn và phân từ quá khứ của lead.', '/lɛd/'],
    ['rode', 'ride', 'Dạng quá khứ đơn của ride.', '/roʊd/'],
    ['rang', 'ring', 'Dạng quá khứ đơn của ring.', '/ræŋ/'],
    ['rung', 'ring', 'Dạng phân từ quá khứ của ring.', '/rʌŋ/'],
    ['sawed', 'saw', 'Dạng quá khứ đơn của saw.', '/sɔːd/'],
    ['sawn', 'saw', 'Dạng phân từ quá khứ của saw.', '/sɔːn/'],
    ['shook', 'shake', 'Dạng quá khứ đơn của shake.', '/ʃʊk/'],
    ['slew', 'slay', 'Dạng quá khứ đơn của slay.', '/sluː/'],
    ['spun', 'spin', 'Dạng quá khứ đơn và phân từ quá khứ của spin.', '/spʌn/'],
    ['spat', 'spit', 'Dạng quá khứ đơn và phân từ quá khứ của spit.', '/spæt/'],
    ['swollen', 'swell', 'Dạng phân từ quá khứ của swell.', '/ˈswoʊ.lən/'],
    ['withstood', 'withstand', 'Dạng quá khứ đơn và phân từ quá khứ của withstand.', '/wɪðˈstʊd/'],
    ['beaten', 'beat', 'Dạng phân từ quá khứ của beat.', '/ˈbiː.tən/'],
    ['bound', 'bind', 'Dạng quá khứ đơn và phân từ quá khứ của bind.', '/baʊnd/'],
    ['bitten', 'bite', 'Dạng phân từ quá khứ của bite.', '/ˈbɪt.ən/'],
    ['bled', 'bleed', 'Dạng quá khứ đơn và phân từ quá khứ của bleed.', '/blɛd/'],
    ['awoken', 'awake', 'Dạng phân từ quá khứ của awake.', '/əˈwoʊ.kən/'],
    ['abode', 'abide', 'Dạng quá khứ đơn và phân từ quá khứ của abide.', '/əˈboʊd/'],
    ['mown', 'mow', 'Dạng phân từ quá khứ của mow.', '/moʊn/']
];

const insertWordStmt = db.prepare('INSERT INTO words (word, source_id, lang_code) VALUES (?, ?, ?)');
const insertDefStmt = db.prepare('INSERT INTO definitions (definition, pos, definition_lang, links) VALUES (?, ?, ?, ?)');
const insertWordDefStmt = db.prepare('INSERT INTO word_definitions (word_id, definition_id, source_id) VALUES (?, ?, ?)');
const insertPronStmt = db.prepare('INSERT OR IGNORE INTO pronunciations (word_id, ipa, region) VALUES (?, ?, ?)');

let addedWordCount = 0;

const runAddMissingVerbs = db.transaction(() => {
    for (const [inflected, root, defText, ipa] of IRREGULAR_MAPPINGS) {
        let wordRow = getWordIdStmt.get(inflected, 'en') as { id: number } | undefined;
        if (!wordRow) {
            const wordRes = insertWordStmt.run(inflected, 4, 'en');
            wordRow = { id: Number(wordRes.lastInsertRowid) };
            addedWordCount++;

            // Insert definition
            const defRes = insertDefStmt.run(defText, 'V', 'vi', JSON.stringify([root]));
            const defId = Number(defRes.lastInsertRowid);
            insertWordDefStmt.run(wordRow.id, defId, 4);

            // Insert pronunciations (US & UK)
            insertPronStmt.run(wordRow.id, ipa, 'US');
            insertPronStmt.run(wordRow.id, ipa, 'UK');
        }

        // Insert relations
        insertRelStmt.run(wordRow.id, root, 'g');
        const rootRow = getWordIdStmt.get(root, 'en') as { id: number } | undefined;
        if (rootRow) {
            insertRelStmt.run(rootRow.id, inflected, 'd');
        }
    }
});

runAddMissingVerbs();
console.log(`Added ${addedWordCount} missing English irregular verbs directly into words table.`);

// Checkpoint and close
db.pragma('wal_checkpoint(TRUNCATE)');
db.close();
console.log('[CLEANUP & ENRICH] Completed successfully and database checkpointed.');
