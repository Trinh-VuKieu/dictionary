import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
console.log(`[PHONETICS-CLEANUP] Opening database at ${dbPath}...`);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// 1. Xóa các hàng IPA rác (IPA trùng với spelling tiếng Anh)
const deletedFake = db.prepare(`
    DELETE FROM pronunciations 
    WHERE id IN (
        SELECT p.id FROM pronunciations p 
        JOIN words w ON p.word_id = w.id 
        WHERE w.lang_code = 'en' AND (
            p.ipa = w.word 
            OR p.ipa = '/' || w.word || '/'
            OR (length(w.word) >= 4 AND replace(replace(replace(p.ipa, '/', ''), '[', ''), ']', '') = w.word)
        )
        AND w.word NOT IN ('bed', 'men', 'pen', 'ten', 'net', 'set', 'let', 'wet', 'red', 'pet', 'went')
    )
`).run();
console.log(`[PHONETICS-CLEANUP] Deleted fake IPA rows: ${deletedFake.changes}`);

// 2. Thêm hoặc cập nhật phiên âm chuẩn cho các từ thông dụng bị thiếu
const wordsToFix: Record<string, { us: string; uk: string }> = {
    'display': { us: '/dɪˈspleɪ/', uk: '/dɪˈspleɪ/' },
    'could': { us: '/kʊd/', uk: '/kʊd/' },
    'would': { us: '/wʊd/', uk: '/wʊd/' },
    'should': { us: '/ʃʊd/', uk: '/ʃʊd/' },
    'mouth': { us: '/maʊθ/', uk: '/maʊθ/' },
    'point': { us: '/pɔɪnt/', uk: '/pɔɪnt/' },
    'south': { us: '/saʊθ/', uk: '/saʊθ/' },
    'software': { us: '/ˈsɔːft.wer/', uk: '/ˈsɒft.weə/' },
    'computer': { us: '/kəmˈpjuː.t̬ɚ/', uk: '/kəmˈpjuː.tə/' },
    'window': { us: '/ˈwɪn.doʊ/', uk: '/ˈwɪn.dəʊ/' },
    'screen': { us: '/skriːn/', uk: '/skriːn/' }
};

const insertPron = db.prepare(`
    INSERT OR REPLACE INTO pronunciations (word_id, ipa, region)
    VALUES (?, ?, ?)
`);

const getWordId = db.prepare(`SELECT id FROM words WHERE word = ? AND lang_code = 'en' LIMIT 1`);

for (const [w, prons] of Object.entries(wordsToFix)) {
    const row = getWordId.get(w) as { id: number } | undefined;
    if (row) {
        insertPron.run(row.id, prons.us, 'US');
        insertPron.run(row.id, prons.uk, 'UK');
        console.log(`[PHONETICS-CLEANUP] Updated pronunciations for '${w}' (id: ${row.id})`);
    } else {
        console.log(`[PHONETICS-CLEANUP] Word '${w}' not found in words table`);
    }
}

db.pragma('wal_checkpoint(TRUNCATE)');
console.log('[PHONETICS-CLEANUP] Done successfully!');
