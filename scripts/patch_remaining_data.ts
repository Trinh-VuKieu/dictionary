import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath);

console.log('=== PATCHING REMAINING DATA ISSUES ===\n');

db.transaction(() => {
    // 1. Thêm định nghĩa chuẩn tiếng Anh cho château, châteaux, pâté, râle
    console.log('1. Bổ sung định nghĩa cho château, châteaux, pâté, râle...');
    
    const insertDef = db.prepare('INSERT OR IGNORE INTO definitions (definition, pos, definition_lang) VALUES (?, ?, ?)');
    const getDefId = db.prepare('SELECT id FROM definitions WHERE definition = ? AND definition_lang = ? LIMIT 1');
    const insertWordDef = db.prepare('INSERT OR IGNORE INTO word_definitions (word_id, definition_id, example, source_id) VALUES (?, ?, ?, 1)');
    const getWord = db.prepare('SELECT id FROM words WHERE word = ? AND lang_code = ? LIMIT 1');

    const defsToAdd: { word: string; lang: string; defs: { def: string; pos: string }[] }[] = [
        {
            word: 'château',
            lang: 'en',
            defs: [
                { def: 'Lâu đài, dinh thự lớn phong cách Pháp.', pos: 'Danh từ' },
                { def: 'A French castle or large country house.', pos: 'Noun' }
            ]
        },
        {
            word: 'châteaux',
            lang: 'en',
            defs: [
                { def: 'Các lâu đài, dinh thự lớn (dạng số nhiều của château).', pos: 'Danh từ' },
                { def: 'Plural of château.', pos: 'Noun' }
            ]
        },
        {
            word: 'pâté',
            lang: 'en',
            defs: [
                { def: 'Pa-tê (món ăn làm từ gan, thịt băm nhuyễn và mỡ).', pos: 'Danh từ' },
                { def: 'A rich savory paste made of finely minced meat or liver.', pos: 'Noun' }
            ]
        },
        {
            word: 'râle',
            lang: 'en',
            defs: [
                { def: 'Tiếng ran (âm thanh bất thường trong phổi khi thở do có dịch).', pos: 'Danh từ' },
                { def: 'An abnormal rattling sound heard when examining unhealthy lungs with a stethoscope.', pos: 'Noun' }
            ]
        }
    ];

    for (const item of defsToAdd) {
        const wRow = getWord.get(item.word, item.lang) as { id: number } | undefined;
        if (wRow) {
            for (const d of item.defs) {
                insertDef.run(d.def, d.pos, 'vi');
                const dRow = getDefId.get(d.def, 'vi') as { id: number };
                if (dRow) {
                    insertWordDef.run(wRow.id, dRow.id, null);
                }
            }
            console.log(`   - Đã thêm định nghĩa cho: ${item.word} (id: ${wRow.id})`);
        }
    }

    // 2. Thêm các từ cốt lõi (his, my, which, only, these) vào words, definitions, pronunciations
    console.log('\n2. Bổ sung từ vựng cốt lõi vào cơ sở dữ liệu SQLite...');
    const insertWord = db.prepare('INSERT OR IGNORE INTO words (word, lang_code, source_id) VALUES (?, ?, 1)');
    const insertPron = db.prepare('INSERT OR IGNORE INTO pronunciations (word_id, ipa, region) VALUES (?, ?, ?)');

    const coreEntries = [
        {
            word: 'his',
            defs: [
                { def: 'Của anh ấy, của ông ấy, của nó (tính từ/đại từ sở hữu).', pos: 'Đại từ' },
                { def: 'Belonging to or associated with a male person or animal.', pos: 'Pronoun' }
            ],
            prons: [
                { ipa: '/hɪz/', region: 'US' },
                { ipa: '/hɪz/', region: 'UK' }
            ]
        },
        {
            word: 'my',
            defs: [
                { def: 'Của tôi (tính từ sở hữu đứng trước danh từ).', pos: 'Đại từ' },
                { def: 'Belonging to or associated with the speaker.', pos: 'Pronoun' }
            ],
            prons: [
                { ipa: '/maɪ/', region: 'US' },
                { ipa: '/maɪ/', region: 'UK' }
            ]
        },
        {
            word: 'which',
            defs: [
                { def: 'Cái nào, người nào, điều mà (đại từ nghi vấn hoặc đại từ quan hệ).', pos: 'Đại từ' },
                { def: 'Asking for information specifying one or more people or things from a definite set.', pos: 'Pronoun' }
            ],
            prons: [
                { ipa: '/wɪtʃ/', region: 'US' },
                { ipa: '/wɪtʃ/', region: 'UK' }
            ]
        },
        {
            word: 'only',
            defs: [
                { def: 'Chỉ, duy nhất.', pos: 'Phó từ' },
                { def: 'And no one or nothing more besides; solely or exclusively.', pos: 'Adverb' }
            ],
            prons: [
                { ipa: '/ˈoʊn.li/', region: 'US' },
                { ipa: '/ˈəʊn.li/', region: 'UK' }
            ]
        },
        {
            word: 'these',
            defs: [
                { def: 'Những cái này, những người này (dạng số nhiều của this).', pos: 'Đại từ' },
                { def: 'Plural form of this.', pos: 'Pronoun' }
            ],
            prons: [
                { ipa: '/ðiːz/', region: 'US' },
                { ipa: '/ðiːz/', region: 'UK' }
            ]
        }
    ];

    for (const c of coreEntries) {
        insertWord.run(c.word, 'en');
        const wRow = getWord.get(c.word, 'en') as { id: number };
        if (wRow) {
            for (const d of c.defs) {
                insertDef.run(d.def, d.pos, 'vi');
                const dRow = getDefId.get(d.def, 'vi') as { id: number };
                if (dRow) {
                    insertWordDef.run(wRow.id, dRow.id, null);
                }
            }
            for (const p of c.prons) {
                insertPron.run(wRow.id, p.ipa, p.region);
            }
            console.log(`   - Đã thêm từ, nghĩa và phát âm cho: '${c.word}' (id: ${wRow.id})`);
        }
    }

    // 3. Chuẩn hóa bọc /.../ cho các ký tự IPA ngắn/tiếng Pháp/Khmer
    console.log('\n3. Bọc /.../ cho các ký tự phiên âm ngắn không có gạch chéo...');
    const unbracketedForeign = db.prepare(`
        SELECT id, word_id, ipa, region 
        FROM pronunciations 
        WHERE ipa NOT LIKE '/%/' 
          AND ipa NOT LIKE '[%]' 
          AND length(trim(ipa)) > 0
    `).all() as { id: number; word_id: number; ipa: string; region: string | null }[];

    const checkPronExists = db.prepare(`
        SELECT id FROM pronunciations 
        WHERE word_id = ? AND ipa = ? AND (region = ? OR (region IS NULL AND ? IS NULL))
    `);
    const updatePronIpa = db.prepare('UPDATE pronunciations SET ipa = ? WHERE id = ?');
    const deletePron = db.prepare('DELETE FROM pronunciations WHERE id = ?');

    let wrappedCount = 0;
    let deletedDupe = 0;

    for (const row of unbracketedForeign) {
        const wrapped = '/' + row.ipa.trim() + '/';
        const exists = checkPronExists.get(row.word_id, wrapped, row.region, row.region) as { id: number } | undefined;
        if (exists && exists.id !== row.id) {
            deletePron.run(row.id);
            deletedDupe++;
        } else {
            updatePronIpa.run(wrapped, row.id);
            wrappedCount++;
        }
    }
    console.log(`   - Đã bọc /.../ cho: ${wrappedCount} hàng, xóa trùng: ${deletedDupe} hàng.`);
})();

db.pragma('wal_checkpoint(TRUNCATE)');
console.log('\n=== PATCH COMPLETE ===');
db.close();
