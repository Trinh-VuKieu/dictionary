import Database from 'better-sqlite3';
import path from 'path';
import { CUSTOM_WORDS } from '../lib/custom_words';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath);

console.log('=== STARTING COMPLETE DATA SCAN & REPAIR ===\n');

db.transaction(() => {
    // -------------------------------------------------------------
    // 1. Fix misclassified CJK words that have lang_code = 'en'
    // -------------------------------------------------------------
    console.log('--- 1. Fixing misclassified CJK words ---');
    const fixZhStmt = db.prepare("UPDATE words SET lang_code = 'zh' WHERE id = ?");
    const fixJaStmt = db.prepare("UPDATE words SET lang_code = 'ja' WHERE id = ?");

    const zhIds = [369216, 337990, 340281, 344067, 346095, 348111];
    for (const id of zhIds) {
        fixZhStmt.run(id);
    }
    fixJaStmt.run(359414); // 暮し
    console.log(`Updated 6 words to 'zh' and 1 word to 'ja'.`);

    // -------------------------------------------------------------
    // 2. Add helpful index for relations
    // -------------------------------------------------------------
    console.log('\n--- 2. Ensuring indexes ---');
    db.prepare("CREATE INDEX IF NOT EXISTS idx_word_relations_related_word ON word_relations(related_word)").run();
    console.log('Index on word_relations(related_word) verified.');

    // -------------------------------------------------------------
    // 3. Populate missing definitions & prons for core words from CUSTOM_WORDS
    // -------------------------------------------------------------
    console.log('\n--- 3. Syncing core words from CUSTOM_WORDS into SQLite ---');
    const getWordStmt = db.prepare("SELECT id FROM words WHERE word = ? AND lang_code = 'en'");
    const getDefCountStmt = db.prepare("SELECT count(*) as c FROM word_definitions WHERE word_id = ?");
    const insertDefStmt = db.prepare("INSERT INTO definitions (definition, pos, definition_lang, links) VALUES (?, ?, ?, ?)");
    const insertWordDefStmt = db.prepare("INSERT INTO word_definitions (word_id, definition_id, source_id) VALUES (?, ?, 4)");
    const insertPronStmt = db.prepare("INSERT OR IGNORE INTO pronunciations (word_id, ipa, region) VALUES (?, ?, ?)");
    const insertRelStmt = db.prepare("INSERT OR IGNORE INTO word_relations (word_id, related_word, relation_type) VALUES (?, ?, ?)");

    const targetWords = [
        'should', 'new', 'eat', 'baby', 'machine', 'music',
        'white', 'table', 'friendship', 'asap', 'aka', 'fyi',
        'idk', 'imho', 'omg', 'afaik', 'gps', 'lan', 'sdk', 'pda'
    ];

    let syncedCustom = 0;
    for (const word of targetWords) {
        const entry = CUSTOM_WORDS[word];
        if (!entry || !entry.results) continue;
        const wordRow = getWordStmt.get(word) as { id: number } | undefined;
        if (!wordRow) continue;

        const defCount = getDefCountStmt.get(wordRow.id) as { c: number };
        if (defCount.c === 0) {
            const enRes = entry.results.find(r => r.lang_code === 'en') || entry.results[0];
            for (const m of enRes.meanings) {
                const defRes = insertDefStmt.run(m.definition, m.pos || 'N', m.definition_lang || 'vi', JSON.stringify(m.links || []));
                insertWordDefStmt.run(wordRow.id, Number(defRes.lastInsertRowid));
            }
            for (const p of enRes.pronunciations) {
                insertPronStmt.run(wordRow.id, p.ipa, p.region || 'US');
                if (p.region === 'UK/US' || !p.region) {
                    insertPronStmt.run(wordRow.id, p.ipa, 'US');
                    insertPronStmt.run(wordRow.id, p.ipa, 'UK');
                }
            }
            for (const rel of enRes.relations) {
                let code = 'r';
                if (rel.relation_type.includes('Đồng nghĩa')) code = 's';
                else if (rel.relation_type.includes('Trái nghĩa')) code = 'a';
                else if (rel.relation_type.includes('Gốc từ')) code = 'g';
                else if (rel.relation_type.includes('phái sinh')) code = 'd';
                insertRelStmt.run(wordRow.id, rel.related_word, code);
            }
            syncedCustom++;
        }
    }
    console.log(`Synced ${syncedCustom} core words from CUSTOM_WORDS into SQLite definitions.`);

    // -------------------------------------------------------------
    // 4. Populate shown, selves, aluminium
    // -------------------------------------------------------------
    console.log('\n--- 4. Populating shown, selves, aluminium ---');
    // shown
    const shownRow = getWordStmt.get('shown') as { id: number } | undefined;
    if (shownRow) {
        const defCount = getDefCountStmt.get(shownRow.id) as { c: number };
        if (defCount.c === 0) {
            const defRes = insertDefStmt.run("Dạng quá khứ phân từ (Past Participle - V3) của động từ 'show' (được chỉ ra, được cho thấy, được trình diễn).", 'V', 'vi', JSON.stringify(['show']));
            insertWordDefStmt.run(shownRow.id, Number(defRes.lastInsertRowid));
            insertPronStmt.run(shownRow.id, '/ʃoʊn/', 'US');
            insertPronStmt.run(shownRow.id, '/ʃəʊn/', 'UK');
            insertRelStmt.run(shownRow.id, 'show', 'g');
            const showRow = getWordStmt.get('show') as { id: number } | undefined;
            if (showRow) {
                insertRelStmt.run(showRow.id, 'shown', 'd');
            }
        }
    }

    // selves
    const selvesRow = getWordStmt.get('selves') as { id: number } | undefined;
    if (selvesRow) {
        const defCount = getDefCountStmt.get(selvesRow.id) as { c: number };
        if (defCount.c === 0) {
            const defRes = insertDefStmt.run("Dạng số nhiều của danh từ 'self' (những bản thân, những cái tôi).", 'N', 'vi', JSON.stringify(['self']));
            insertWordDefStmt.run(selvesRow.id, Number(defRes.lastInsertRowid));
            insertPronStmt.run(selvesRow.id, '/sɛlvz/', 'US');
            insertPronStmt.run(selvesRow.id, '/sɛlvz/', 'UK');
            insertRelStmt.run(selvesRow.id, 'self', 'g');
            const selfRow = getWordStmt.get('self') as { id: number } | undefined;
            if (selfRow) {
                insertRelStmt.run(selfRow.id, 'selves', 'd');
            }
        }
    }

    // aluminium
    const alumRow = getWordStmt.get('aluminium') as { id: number } | undefined;
    if (alumRow) {
        const defCount = getDefCountStmt.get(alumRow.id) as { c: number };
        if (defCount.c === 0) {
            const defRes = insertDefStmt.run("Nhôm (nguyên tố hóa học Al, số nguyên tử 13) - kim loại nhẹ màu trắng bạc. Chính tả tiêu chuẩn trong tiếng Anh - Anh (UK), tương đương với 'aluminum' trong tiếng Anh - Mỹ (US).", 'N', 'vi', JSON.stringify(['aluminum', 'Al']));
            insertWordDefStmt.run(alumRow.id, Number(defRes.lastInsertRowid));
            insertPronStmt.run(alumRow.id, '/ˌæl.jəˈmɪn.i.əm/', 'UK');
            insertPronStmt.run(alumRow.id, '/ˌæl.jəˈmɪn.i.əm/', 'US');
            insertRelStmt.run(alumRow.id, 'aluminum', 's');
            const alumUsRow = getWordStmt.get('aluminum') as { id: number } | undefined;
            if (alumUsRow) {
                insertRelStmt.run(alumUsRow.id, 'aluminium', 's');
            }
        }
    }
    console.log('Populated shown, selves, aluminium.');

    // -------------------------------------------------------------
    // 5. Populate missing Latin/medical plurals
    // -------------------------------------------------------------
    console.log('\n--- 5. Populating Latin/medical plural words with 0 defs ---');
    const pluralMappings: [string, string, string][] = [
        ['amphioxi', 'amphioxus', '/ˌæm.fiˈɑːk.saɪ/'],
        ['macrosporangia', 'macrosporangium', '/ˌmæk.roʊ.spəˈræn.dʒi.ə/'],
        ['manubria', 'manubrium', '/məˈnuː.bri.ə/'],
        ['meatuses', 'meatus', '/miˈeɪ.təs.ɪz/'],
        ['mediastina', 'mediastinum', '/ˌmiː.di.əˈstaɪ.nə/'],
        ['mediums', 'medium', '/ˈmiː.di.əmz/'],
        ['mesdames', 'madame', '/meɪˈdɑːm/'],
        ['mesdemoiselles', 'mademoiselle', '/ˌmeɪd.mwɑːˈzɛl/'],
        ['mesotheliomas', 'mesothelioma', '/ˌmɛz.oʊˌθiː.liˈoʊ.məz/'],
        ['moduli', 'modulus', '/ˈmɑː.dʒə.laɪ/'],
        ['nucleoli', 'nucleolus', '/njuːˈkliː.ə.laɪ/'],
        ['termites', 'termite', '/ˈtɜːr.maɪts/'],
        ['testae', 'testa', '/ˈtɛs.tiː/'],
        ['thrombi', 'thrombus', '/ˈθrɑːm.baɪ/'],
        ['tintinnabula', 'tintinnabulum', '/ˌtɪn.tɪˈnæb.jə.lə/'],
        ['vagi', 'vagus', '/ˈveɪ.ɡaɪ/'],
        ['valleculae', 'vallecula', '/vəˈlɛk.jə.liː/']
    ];

    let pluralCount = 0;
    for (const [plural, root, ipa] of pluralMappings) {
        const pRow = getWordStmt.get(plural) as { id: number } | undefined;
        if (pRow) {
            const defCount = getDefCountStmt.get(pRow.id) as { c: number };
            if (defCount.c === 0) {
                const defRes = insertDefStmt.run(`Dạng số nhiều của danh từ '${root}'.`, 'N', 'vi', JSON.stringify([root]));
                insertWordDefStmt.run(pRow.id, Number(defRes.lastInsertRowid));
                insertPronStmt.run(pRow.id, ipa, 'US');
                insertPronStmt.run(pRow.id, ipa, 'UK');
                insertRelStmt.run(pRow.id, root, 'g');
                const rootRow = getWordStmt.get(root) as { id: number } | undefined;
                if (rootRow) {
                    insertRelStmt.run(rootRow.id, plural, 'd');
                }
                pluralCount++;
            }
        }
    }
    console.log(`Populated ${pluralCount} Latin/medical plural words.`);

    // -------------------------------------------------------------
    // 6. Populate missing pronunciations for 25 high-frequency irregular verbs
    // -------------------------------------------------------------
    console.log('\n--- 6. Populating missing pronunciations for 25 irregular verbs ---');
    const irregularProns: [string, string, string][] = [
        ['went', '/wɛnt/', '/wɛnt/'],
        ['goes', '/ɡoʊz/', '/ɡəʊz/'],
        ['ate', '/eɪt/', '/et/'],
        ['eaten', '/ˈiː.tən/', '/ˈiː.tən/'],
        ['taken', '/ˈteɪ.kən/', '/ˈteɪ.kən/'],
        ['began', '/bɪˈɡæn/', '/bɪˈɡæn/'],
        ['begun', '/bɪˈɡʌn/', '/bɪˈɡʌn/'],
        ['drunk', '/drʌŋk/', '/drʌŋk/'],
        ['swam', '/swæm/', '/swæm/'],
        ['broke', '/broʊk/', '/brəʊk/'],
        ['broken', '/ˈbroʊ.kən/', '/ˈbrəʊ.kən/'],
        ['frozen', '/ˈfroʊ.zən/', '/ˈfrəʊ.zən/'],
        ['chose', '/tʃoʊz/', '/tʃəʊz/'],
        ['chosen', '/ˈtʃoʊ.zən/', '/ˈtʃəʊ.zən/'],
        ['brought', '/brɔːt/', '/brɔːt/'],
        ['caught', '/kɔːt/', '/kɔːt/'],
        ['taught', '/tɔːt/', '/tɔːt/'],
        ['thought', '/θɔːt/', '/θɔːt/'],
        ['fought', '/fɔːt/', '/fɔːt/'],
        ['understood', '/ˌʌn.dɚˈstʊd/', '/ˌʌn.dəˈstʊd/'],
        ['met', '/mɛt/', '/mɛt/'],
        ['built', '/bɪlt/', '/bɪlt/'],
        ['shot', '/ʃɑːt/', '/ʃɒt/'],
        ['shone', '/ʃoʊn/', '/ʃɒn/'],
        ['clung', '/klʌŋ/', '/klʌŋ/']
    ];

    let pronCount = 0;
    for (const [w, usIpa, ukIpa] of irregularProns) {
        const row = getWordStmt.get(w) as { id: number } | undefined;
        if (row) {
            insertPronStmt.run(row.id, usIpa, 'US');
            insertPronStmt.run(row.id, ukIpa, 'UK');
            pronCount++;
        }
    }
    console.log(`Populated authentic US/UK pronunciations for ${pronCount} irregular verbs.`);

    // -------------------------------------------------------------
    // 7. Populate reciprocal relations (s, a, d)
    // -------------------------------------------------------------
    console.log('\n--- 7. Populating reciprocal relations (s, a, d) ---');

    // Synonyms reciprocal
    const sToAdd = db.prepare(`
        SELECT DISTINCT w_rel.id as word_id, w.word as related_word, 's' as relation_type
        FROM word_relations wr
        JOIN words w ON wr.word_id = w.id
        JOIN words w_rel ON w_rel.word = wr.related_word AND w_rel.lang_code = w.lang_code
        LEFT JOIN word_relations wr_recip ON wr_recip.word_id = w_rel.id AND wr_recip.related_word = w.word AND wr_recip.relation_type = 's'
        WHERE wr.relation_type = 's' 
          AND wr_recip.id IS NULL
          AND lower(w.word) != lower(w_rel.word)
    `).all() as { word_id: number; related_word: string; relation_type: string }[];

    for (const item of sToAdd) {
        insertRelStmt.run(item.word_id, item.related_word, 's');
    }
    console.log(`Inserted ${sToAdd.length} reciprocal synonym relations.`);

    // Antonyms reciprocal
    const aToAdd = db.prepare(`
        SELECT DISTINCT w_rel.id as word_id, w.word as related_word, 'a' as relation_type
        FROM word_relations wr
        JOIN words w ON wr.word_id = w.id
        JOIN words w_rel ON w_rel.word = wr.related_word AND w_rel.lang_code = w.lang_code
        LEFT JOIN word_relations wr_recip ON wr_recip.word_id = w_rel.id AND wr_recip.related_word = w.word AND wr_recip.relation_type = 'a'
        WHERE wr.relation_type = 'a' 
          AND wr_recip.id IS NULL
          AND lower(w.word) != lower(w_rel.word)
    `).all() as { word_id: number; related_word: string; relation_type: string }[];

    for (const item of aToAdd) {
        insertRelStmt.run(item.word_id, item.related_word, 'a');
    }
    console.log(`Inserted ${aToAdd.length} reciprocal antonym relations.`);

    // Derivatives reciprocal
    const dToAdd = db.prepare(`
        SELECT DISTINCT w_root.id as word_id, w.word as related_word, 'd' as relation_type
        FROM word_relations wr
        JOIN words w ON wr.word_id = w.id
        JOIN words w_root ON w_root.word = wr.related_word AND w_root.lang_code = w.lang_code
        LEFT JOIN word_relations wr_d ON wr_d.word_id = w_root.id AND wr_d.related_word = w.word AND wr_d.relation_type = 'd'
        WHERE wr.relation_type = 'g' 
          AND wr_d.id IS NULL
          AND lower(w.word) != lower(w_root.word)
    `).all() as { word_id: number; related_word: string; relation_type: string }[];

    for (const item of dToAdd) {
        insertRelStmt.run(item.word_id, item.related_word, 'd');
    }
    console.log(`Inserted ${dToAdd.length} reciprocal derivative relations.`);

    // -------------------------------------------------------------
    // 8. Populate unmapped compound/phrase relations
    // -------------------------------------------------------------
    console.log('\n--- 8. Populating unmapped compound/phrase relations ---');
    const extraPatterns = [
        /(?:quá khứ(?: đơn)?|dạng quá khứ|phân từ(?: hai| quá khứ)?)\s+của\s+([a-zA-Z0-9\s\-']+?)(?=[.,;\n\r\(\)]|$)/i,
        /(?:số nhiều|dạng số nhiều)\s+của\s+([a-zA-Z0-9\s\-']+?)(?=[.,;\n\r\(\)]|$)/i,
        /(?:so sánh hơn|so sánh nhất|dạng so sánh)\s+của\s+([a-zA-Z0-9\s\-']+?)(?=[.,;\n\r\(\)]|$)/i,
        /(?:ngôi thứ ba|thì hiện tại đơn ngôi thứ ba)\s+của\s+([a-zA-Z0-9\s\-']+?)(?=[.,;\n\r\(\)]|$)/i,
        /(?:tiếp diễn|phân từ hiện tại|dạng -ing|v-ing)\s+của\s+([a-zA-Z0-9\s\-']+?)(?=[.,;\n\r\(\)]|$)/i
    ];

    const candidateDefs = db.prepare(`
        SELECT w.id, w.word, d.definition
        FROM words w
        JOIN word_definitions wd ON w.id = wd.word_id
        JOIN definitions d ON wd.definition_id = d.id
        WHERE w.lang_code = 'en'
          AND d.definition LIKE '%của %'
    `).all() as { id: number; word: string; definition: string }[];

    let unmappedAdded = 0;
    for (const row of candidateDefs) {
        for (const pat of extraPatterns) {
            const m = row.definition.match(pat);
            if (m) {
                const root = m[1].trim();
                if (!root || root.toLowerCase() === row.word.toLowerCase()) continue;
                const res = insertRelStmt.run(row.id, root, 'g');
                if (res.changes > 0) {
                    unmappedAdded++;
                    const rootRow = getWordStmt.get(root) as { id: number } | undefined;
                    if (rootRow) {
                        insertRelStmt.run(rootRow.id, row.word, 'd');
                    }
                }
                break;
            }
        }
    }
    console.log(`Added ${unmappedAdded} unmapped compound/phrase relations.`);
})();

console.log('\n--- Checkpointing SQLite WAL ---');
db.pragma('wal_checkpoint(TRUNCATE)');
db.close();
console.log('=== COMPLETE DATA SCAN & REPAIR FINISHED SUCCESSFULLY ===');
