import Database from 'better-sqlite3';
import path from 'path';
import { lookupWordSync } from '../lib/dictionary';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath, { readonly: true });

console.log('===============================================================');
console.log('🔍 BẮT ĐẦU QUÉT CHI TIẾT: PHIÊN ÂM, NGHĨA TỪ, TỪ GỐC, DỮ LIỆU');
console.log('===============================================================\n');

interface Issue {
    category: 'PHIÊN ÂM' | 'NGHĨA CỦA TỪ' | 'TỪ GỐC / QUAN HỆ' | 'TỪ VỰNG';
    severity: 'LỖI (HIGH)' | 'CẢNH BÁO (MEDIUM)' | 'GÓP Ý (LOW)';
    description: string;
    count: number;
    samples: any[];
}

const issues: Issue[] = [];

// ============================================================================
// PHẦN 1: QUÉT PHIÊN ÂM (PRONUNCIATIONS)
// ============================================================================
console.log('--- 1. ĐANG QUÉT PHIÊN ÂM (PRONUNCIATIONS) ---');

// 1.1. Phiên âm rác: IPA trùng với mặt chữ tiếng Anh (fake spelling)
const fakeIpa = db.prepare(`
    SELECT w.word, p.ipa, p.region 
    FROM pronunciations p 
    JOIN words w ON p.word_id = w.id 
    WHERE w.lang_code = 'en' AND (
        p.ipa = w.word 
        OR p.ipa = '/' || w.word || '/'
        OR (length(w.word) >= 4 AND replace(replace(replace(replace(p.ipa, '/', ''), '[', ''), ']', ''), ' ', '') = w.word)
    )
    AND w.word NOT IN ('bed', 'men', 'pen', 'ten', 'net', 'set', 'let', 'wet', 'red', 'pet', 'went')
`).all() as { word: string; ipa: string; region: string }[];

if (fakeIpa.length > 0) {
    issues.push({
        category: 'PHIÊN ÂM',
        severity: 'LỖI (HIGH)',
        description: 'Phiên âm rác: IPA trùng khớp với mặt chữ tiếng Anh (fake spelling IPA)',
        count: fakeIpa.length,
        samples: fakeIpa.slice(0, 10)
    });
}

// 1.2. IPA rỗng, dị dạng hoặc chứa ký tự lạ (chứa HTML, ?, NaN, undefined, dấu gạch chéo rỗng //)
const malformedIpa = db.prepare(`
    SELECT w.word, w.lang_code, p.ipa, p.region 
    FROM pronunciations p 
    JOIN words w ON p.word_id = w.id 
    WHERE trim(p.ipa) IN ('', '//', '[]', '/', '[-] ', 'nan', 'undefined', 'null')
       OR p.ipa LIKE '%<%>%' 
       OR p.ipa LIKE '%?%' 
       OR p.ipa LIKE '%\ufffd%'
       OR length(trim(p.ipa)) < 2
`).all() as { word: string; lang_code: string; ipa: string; region: string }[];

if (malformedIpa.length > 0) {
    issues.push({
        category: 'PHIÊN ÂM',
        severity: 'LỖI (HIGH)',
        description: 'IPA rỗng, chứa ký tự lạ (?, HTML), lỗi encoding hoặc chỉ có cặp dấu gạch chéo rỗng',
        count: malformedIpa.length,
        samples: malformedIpa.slice(0, 10)
    });
}

// 1.3. IPA không bọc trong /.../ hoặc [...]
const unbracketedIpa = db.prepare(`
    SELECT w.word, w.lang_code, p.ipa 
    FROM pronunciations p 
    JOIN words w ON p.word_id = w.id 
    WHERE w.lang_code = 'en'
      AND p.ipa NOT LIKE '/%/'
      AND p.ipa NOT LIKE '[%]'
      AND length(p.ipa) > 1
`).all() as { word: string; lang_code: string; ipa: string }[];

if (unbracketedIpa.length > 0) {
    issues.push({
        category: 'PHIÊN ÂM',
        severity: 'CẢNH BÁO (MEDIUM)',
        description: 'IPA tiếng Anh không được bao bởi cặp dấu gạch chéo /.../ hoặc vuông [...]',
        count: unbracketedIpa.length,
        samples: unbracketedIpa.slice(0, 10)
    });
}

// 1.4. Kiểm tra 150 từ tiếng Anh cốt lõi xem có từ nào thiếu cả US và UK IPA trong DB
const coreEnWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'display', 'screen', 'software', 'window', 'computer', 'mouse', 'keyboard', 'phone'
];

const missingCoreIpa: string[] = [];
for (const w of coreEnWords) {
    const prons = db.prepare(`
        SELECT p.ipa, p.region 
        FROM pronunciations p 
        JOIN words w ON p.word_id = w.id 
        WHERE w.lang_code = 'en' AND w.word = ?
    `).all(w) as { ipa: string; region: string }[];
    if (prons.length === 0) {
        missingCoreIpa.push(w);
    }
}

if (missingCoreIpa.length > 0) {
    issues.push({
        category: 'PHIÊN ÂM',
        severity: 'CẢNH BÁO (MEDIUM)',
        description: 'Từ vựng tiếng Anh thông dụng thiếu bản ghi phát âm tĩnh trong bảng pronunciations',
        count: missingCoreIpa.length,
        samples: missingCoreIpa
    });
}

// ============================================================================
// PHẦN 2: QUÉT ĐỊNH NGHĨA CỦA TỪ (DEFINITIONS)
// ============================================================================
console.log('--- 2. ĐANG QUÉT NGHĨA CỦA TỪ (DEFINITIONS) ---');

// 2.1. Định nghĩa rác hoặc chỉ có dấu câu đơn lẻ
const junkDefs = db.prepare(`
    SELECT d.id, d.definition, d.pos, d.definition_lang, count(wd.id) as used_count
    FROM definitions d
    LEFT JOIN word_definitions wd ON d.id = wd.definition_id
    WHERE trim(d.definition) IN ('', '.', '-', '--', '...', ',', '?', ':', ';', 'null', 'undefined', 'n/a', 'updating')
       OR (length(trim(d.definition)) = 1 AND trim(d.definition) NOT IN ('A', 'ở', 'Ý', 'à', 'ê', 'ô', 'a', 'i', 'o', 'u', 'y'))
    GROUP BY d.id
`).all() as { id: number; definition: string; pos: string; definition_lang: string; used_count: number }[];

if (junkDefs.length > 0) {
    issues.push({
        category: 'NGHĨA CỦA TỪ',
        severity: 'LỖI (HIGH)',
        description: 'Định nghĩa rác / rỗng / chỉ gồm dấu câu đơn lẻ trong bảng definitions',
        count: junkDefs.length,
        samples: junkDefs.slice(0, 10)
    });
}

// 2.2. Định nghĩa chứa thẻ HTML chưa được bóc tách
const htmlDefs = db.prepare(`
    SELECT d.id, substr(d.definition, 1, 100) as snippet, d.pos, d.definition_lang
    FROM definitions d
    WHERE d.definition LIKE '%<div%'
       OR d.definition LIKE '%<span%'
       OR d.definition LIKE '%<p>%'
       OR d.definition LIKE '%<br%'
       OR d.definition LIKE '%<a href%'
`).all() as { id: number; snippet: string; pos: string; definition_lang: string }[];

if (htmlDefs.length > 0) {
    issues.push({
        category: 'NGHĨA CỦA TỪ',
        severity: 'CẢNH BÁO (MEDIUM)',
        description: 'Định nghĩa chứa thẻ HTML thô (chưa được làm sạch)',
        count: htmlDefs.length,
        samples: htmlDefs.slice(0, 10)
    });
}

// 2.3. Định nghĩa bị lỗi font / ký tự hỏng (encoding / mojibake)
const encodingDefs = db.prepare(`
    SELECT d.id, substr(d.definition, 1, 80) as snippet, d.definition_lang
    FROM definitions d
    WHERE d.definition LIKE '%\ufffd%'
       OR d.definition LIKE '%Ã¡%'
       OR d.definition LIKE '%Ã©%'
       OR d.definition LIKE '%Ã³%'
       OR d.definition LIKE '%Ãº%'
`).all() as { id: number; snippet: string; definition_lang: string }[];

if (encodingDefs.length > 0) {
    issues.push({
        category: 'NGHĨA CỦA TỪ',
        severity: 'LỖI (HIGH)',
        description: 'Định nghĩa bị lỗi mã hóa font (mojibake / ký tự replacement \\ufffd)',
        count: encodingDefs.length,
        samples: encodingDefs.slice(0, 10)
    });
}

// 2.4. Từ tiếng Việt hoặc tiếng Anh không có bất kỳ định nghĩa nào
const wordsWithZeroDefs = db.prepare(`
    SELECT w.lang_code, count(*) as count
    FROM words w
    LEFT JOIN word_definitions wd ON w.id = wd.word_id
    WHERE wd.id IS NULL AND w.lang_code IN ('vi', 'en')
    GROUP BY w.lang_code
`).all() as { lang_code: string; count: number }[];

for (const row of wordsWithZeroDefs) {
    if (row.count > 0) {
        const samples = db.prepare(`
            SELECT w.id, w.word, w.lang_code 
            FROM words w 
            LEFT JOIN word_definitions wd ON w.id = wd.word_id 
            WHERE wd.id IS NULL AND w.lang_code = ? 
            LIMIT 10
        `).all(row.lang_code);
        issues.push({
            category: 'NGHĨA CỦA TỪ',
            severity: 'CẢNH BÁO (MEDIUM)',
            description: `Có từ ngôn ngữ '${row.lang_code}' không có bất kỳ định nghĩa nào trong cơ sở dữ liệu`,
            count: row.count,
            samples
        });
    }
}

// 2.5. Bản ghi liên kết word_definitions mồ côi
const orphanedWordDefs = db.prepare(`
    SELECT count(*) as count 
    FROM word_definitions wd 
    LEFT JOIN words w ON wd.word_id = w.id 
    WHERE w.id IS NULL
`).get() as { count: number };

if (orphanedWordDefs.count > 0) {
    issues.push({
        category: 'NGHĨA CỦA TỪ',
        severity: 'LỖI (HIGH)',
        description: 'Bản ghi liên kết word_definitions mồ côi (word_id không tồn tại trong bảng words)',
        count: orphanedWordDefs.count,
        samples: []
    });
}

// ============================================================================
// PHẦN 3: QUÉT TỪ GỐC VÀ QUAN HỆ TỪ (ROOT WORDS / RELATIONS)
// ============================================================================
console.log('--- 3. ĐANG QUÉT TỪ GỐC VÀ QUAN HỆ TỪ (WORD RELATIONS) ---');

// 3.1. Quan hệ tự trỏ vào chính mình (Self-referencing root: word == related_word)
const selfReferencingRoots = db.prepare(`
    SELECT w.word, wr.relation_type, wr.related_word 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE lower(trim(w.word)) = lower(trim(wr.related_word))
`).all() as { word: string; relation_type: string; related_word: string }[];

if (selfReferencingRoots.length > 0) {
    issues.push({
        category: 'TỪ GỐC / QUAN HỆ',
        severity: 'LỖI (HIGH)',
        description: 'Từ có quan hệ trỏ vào chính nó (ví dụ word = "dog" có quan hệ = "dog")',
        count: selfReferencingRoots.length,
        samples: selfReferencingRoots.slice(0, 10)
    });
}

// 3.2. Từ gốc sai trên các từ cơ bản (False stems on base words)
const baseWordsAudit = [
    { word: 'this', forbiddenRoot: ['thi', 'th'] },
    { word: 'that', forbiddenRoot: ['th'] },
    { word: 'these', forbiddenRoot: ['the'] },
    { word: 'matter', forbiddenRoot: ['mat'] },
    { word: 'flower', forbiddenRoot: ['flow'] },
    { word: 'letter', forbiddenRoot: ['let'] },
    { word: 'water', forbiddenRoot: ['wat'] },
    { word: 'brother', forbiddenRoot: ['broth'] },
    { word: 'sister', forbiddenRoot: ['sist'] },
    { word: 'dinner', forbiddenRoot: ['din'] },
    { word: 'summer', forbiddenRoot: ['sum'] },
    { word: 'winter', forbiddenRoot: ['wint'] },
    { word: 'finger', forbiddenRoot: ['fing'] },
    { word: 'corner', forbiddenRoot: ['corn'] },
    { word: 'order', forbiddenRoot: ['ord'] },
    { word: 'paper', forbiddenRoot: ['pap'] },
    { word: 'number', forbiddenRoot: ['numb'] },
    { word: 'member', forbiddenRoot: ['memb'] },
    { word: 'power', forbiddenRoot: ['pow'] },
    { word: 'early', forbiddenRoot: ['ear'] },
    { word: 'only', forbiddenRoot: ['on'] },
    { word: 'daily', forbiddenRoot: ['dai', 'dayly'] },
    { word: 'belly', forbiddenRoot: ['bell'] },
    { word: 'uncle', forbiddenRoot: ['unc'] },
    { word: 'unit', forbiddenRoot: ['un'] },
    { word: 'under', forbiddenRoot: ['und'] },
    { word: 'gas', forbiddenRoot: ['ga'] },
    { word: 'bus', forbiddenRoot: ['bu'] },
    { word: 'plus', forbiddenRoot: ['plu'] },
    { word: 'focus', forbiddenRoot: ['foc'] },
    { word: 'virus', forbiddenRoot: ['vir'] },
    { word: 'display', forbiddenRoot: ['play'] },
    { word: 'discover', forbiddenRoot: ['cover'] },
    { word: 'distant', forbiddenRoot: ['dist'] },
    { word: 'disease', forbiddenRoot: ['ease'] }
];

const bogusRootsFound: { word: string; relation_type: string; root: string }[] = [];
for (const item of baseWordsAudit) {
    const rels = db.prepare(`
        SELECT wr.relation_type, wr.related_word 
        FROM word_relations wr 
        JOIN words w ON wr.word_id = w.id 
        WHERE w.lang_code = 'en' AND lower(w.word) = ? AND wr.relation_type IN ('g', 'Gốc từ')
    `).all(item.word) as { relation_type: string; related_word: string }[];

    for (const r of rels) {
        if (item.forbiddenRoot.includes(r.related_word.toLowerCase())) {
            bogusRootsFound.push({ word: item.word, relation_type: r.relation_type, root: r.related_word });
        }
    }
}

if (bogusRootsFound.length > 0) {
    issues.push({
        category: 'TỪ GỐC / QUAN HỆ',
        severity: 'LỖI (HIGH)',
        description: 'Từ vựng cơ bản bị gán sai từ gốc giả mạo (False stems)',
        count: bogusRootsFound.length,
        samples: bogusRootsFound
    });
}

// 3.3. In-memory check: Quan hệ vòng lặp A là gốc của B và B là gốc của A
console.log('   - Đang kiểm tra vòng lặp quan hệ gốc từ...');
const allGRelations = db.prepare(`
    SELECT lower(w.word) as word, lower(wr.related_word) as root
    FROM word_relations wr
    JOIN words w ON wr.word_id = w.id
    WHERE wr.relation_type IN ('g', 'Gốc từ')
`).all() as { word: string; root: string }[];

const rootMap = new Map<string, Set<string>>();
for (const r of allGRelations) {
    if (!rootMap.has(r.word)) {
        rootMap.set(r.word, new Set());
    }
    rootMap.get(r.word)!.add(r.root);
}

const cyclicRoots: { word_a: string; word_b: string }[] = [];
for (const [word, roots] of rootMap.entries()) {
    for (const root of roots) {
        if (word < root && rootMap.get(root)?.has(word)) {
            cyclicRoots.push({ word_a: word, word_b: root });
        }
    }
}

if (cyclicRoots.length > 0) {
    issues.push({
        category: 'TỪ GỐC / QUAN HỆ',
        severity: 'LỖI (HIGH)',
        description: 'Quan hệ từ gốc bị vòng lặp hai chiều mâu thuẫn (A là gốc của B và B là gốc của A)',
        count: cyclicRoots.length,
        samples: cyclicRoots.slice(0, 10)
    });
}

// 3.4. Thống kê các relation_type trong DB
const distinctRelTypes = db.prepare(`
    SELECT relation_type, count(*) as count 
    FROM word_relations 
    GROUP BY relation_type
`).all() as { relation_type: string; count: number }[];
console.log('   - Thống kê các loại quan hệ (relation_type):');
console.table(distinctRelTypes);

// 3.5. Kiểm tra related_word có chứa khoảng trắng thừa hoặc rỗng
const malformedRelatedWords = db.prepare(`
    SELECT wr.id, w.word, wr.relation_type, wr.related_word 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE trim(wr.related_word) != wr.related_word 
       OR wr.related_word LIKE '%<%>%' 
       OR wr.related_word LIKE '%\\%'
       OR length(trim(wr.related_word)) = 0
`).all() as { id: number; word: string; relation_type: string; related_word: string }[];

if (malformedRelatedWords.length > 0) {
    issues.push({
        category: 'TỪ GỐC / QUAN HỆ',
        severity: 'LỖI (HIGH)',
        description: 'Từ liên quan (related_word) chứa khoảng trắng thừa hoặc rỗng',
        count: malformedRelatedWords.length,
        samples: malformedRelatedWords.slice(0, 10)
    });
}

// ============================================================================
// PHẦN 4: TEST THỰC TẾ TRA CỨU QUA LOOKUP ENGINE (RUNTIME TEST)
// ============================================================================
console.log('--- 4. ĐANG TEST THỰC TẾ TRA CỨU QUA LOOKUP ENGINE (RUNTIME TEST) ---');

const testCases = [
    { word: 'displaying', expectRoot: 'display', expectIpa: '/dɪˈspleɪ.ɪŋ/' },
    { word: 'went', expectRoot: 'go' },
    { word: 'better', expectRoot: 'good' },
    { word: 'happiness', expectRoot: 'happy' },
    { word: 'teacher', expectRoot: 'teach' },
    { word: 'unhappy', expectRoot: 'happy' },
    { word: 'dislike', expectRoot: 'like' },
    { word: 'impossible', expectRoot: 'possible' },
    { word: 'quickly', expectRoot: 'quick' },
    { word: 'development', expectRoot: 'develop' },
    { word: 'ha noi', expectVi: true },
    { word: 'học sinh', expectVi: true }
];

const runtimeFailures: any[] = [];
for (const tc of testCases) {
    const res = lookupWordSync(tc.word);
    const top = res.results[0];
    if (!top) {
        runtimeFailures.push({ word: tc.word, reason: 'Không có kết quả trả về' });
        continue;
    }
    
    // Check root
    if (tc.expectRoot) {
        const roots = top.relations?.filter(r => r.relation_type === 'Gốc từ' || r.relation_type === 'g').map(r => r.related_word.toLowerCase()) || [];
        if (!roots.includes(tc.expectRoot.toLowerCase())) {
            runtimeFailures.push({
                word: tc.word,
                expectedRoot: tc.expectRoot,
                actualRoots: roots,
                reason: `Không tìm thấy gốc từ '${tc.expectRoot}' trong relations`
            });
        }
    }

    // Check IPA
    if (tc.expectIpa) {
        const ipas = top.pronunciations?.map(p => p.ipa) || [];
        if (!ipas.some(ipa => ipa.includes(tc.expectIpa) || ipa === tc.expectIpa)) {
            runtimeFailures.push({
                word: tc.word,
                expectedIpa: tc.expectIpa,
                actualIpas: ipas,
                reason: `Phiên âm không khớp '${tc.expectIpa}'`
            });
        }
    }
}

if (runtimeFailures.length > 0) {
    issues.push({
        category: 'TỪ GỐC / QUAN HỆ',
        severity: 'CẢNH BÁO (MEDIUM)',
        description: 'Một số từ phái sinh / biến thể không nhận diện được gốc từ hoặc phiên âm đúng khi tra cứu runtime',
        count: runtimeFailures.length,
        samples: runtimeFailures
    });
}

// ============================================================================
// BÁO CÁO TỔNG HỢP
// ============================================================================
console.log('\n===============================================================');
console.log('📋 BÁO CÁO KẾT QUẢ QUÉT TỔNG HỢP');
console.log('===============================================================\n');

console.log(`Phát hiện tổng cộng ${issues.length} nhóm vấn đề:\n`);
for (let i = 0; i < issues.length; i++) {
    const it = issues[i];
    console.log(`[${i + 1}] [${it.severity}] [${it.category}]`);
    console.log(`    Mô tả: ${it.description}`);
    console.log(`    Số lượng vi phạm: ${it.count}`);
    console.log(`    Mẫu dữ liệu:`, JSON.stringify(it.samples.slice(0, 5), null, 2));
    console.log('');
}
