import Database from 'better-sqlite3';
import path from 'path';
import { lookupWordSync } from '../lib/dictionary';
// @ts-expect-error wink-lemmatizer lacks types
import lemmatize from 'wink-lemmatizer';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath, { readonly: true });

console.log('================================================================');
console.log('🛡️  BẮT ĐẦU KIỂM TRA TOÀN DIỆN MỌI DỮ LIỆU & LOGIC XỬ LÝ (ULTRA AUDIT)');
console.log('================================================================\n');

interface AuditFinding {
    layer: 'DATABASE - WORDS' | 'DATABASE - PRONUNCIATIONS' | 'DATABASE - DEFINITIONS' | 'DATABASE - RELATIONS' | 'DATABASE - TRANSLATIONS' | 'ENGINE - LOOKUP LOGIC';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    issue: string;
    details: any;
}

const findings: AuditFinding[] = [];

// =============================================================================
// 1. KIỂM TRA BẢNG WORDS
// =============================================================================
console.log('1️⃣  Đang kiểm tra bảng WORDS...');

// 1.1. Từ có khoảng trắng đầu/cuối
const whitespaceWords = db.prepare(`
    SELECT id, word, lang_code 
    FROM words 
    WHERE trim(word) != word OR word LIKE ' %' OR word LIKE '% ' OR word LIKE '%\t%' OR word LIKE '%\n%'
`).all();

if (whitespaceWords.length > 0) {
    findings.push({
        layer: 'DATABASE - WORDS',
        severity: 'CRITICAL',
        issue: `Có ${whitespaceWords.length} từ chứa khoảng trắng thừa (leading/trailing/tab/newline)`,
        details: whitespaceWords.slice(0, 10)
    });
}

// 1.2. Từ có ký tự điều khiển (control characters: newline, carriage return, tab)
const controlCharWords = db.prepare(`
    SELECT id, word, lang_code 
    FROM words 
    WHERE instr(word, char(10)) > 0 
       OR instr(word, char(13)) > 0 
       OR instr(word, char(9)) > 0
`).all();

if (controlCharWords.length > 0) {
    findings.push({
        layer: 'DATABASE - WORDS',
        severity: 'CRITICAL',
        issue: `Có ${controlCharWords.length} từ chứa ký tự điều khiển ẩn`,
        details: controlCharWords.slice(0, 10)
    });
}

// 1.3. Trùng lặp (word, lang_code)
const dupeWords = db.prepare(`
    SELECT word, lang_code, count(*) as c 
    FROM words 
    GROUP BY word, lang_code 
    HAVING c > 1
`).all();

if (dupeWords.length > 0) {
    findings.push({
        layer: 'DATABASE - WORDS',
        severity: 'CRITICAL',
        issue: `Có ${dupeWords.length} từ bị duplicate cùng ngôn ngữ`,
        details: dupeWords.slice(0, 10)
    });
}

// =============================================================================
// 2. KIỂM TRA BẢNG PRONUNCIATIONS
// =============================================================================
console.log('2️⃣  Đang kiểm tra bảng PRONUNCIATIONS...');

// 2.1. Bản ghi mồ côi (word_id không tồn tại)
const orphanProns = db.prepare(`
    SELECT count(*) as c 
    FROM pronunciations p 
    LEFT JOIN words w ON p.word_id = w.id 
    WHERE w.id IS NULL
`).get() as { c: number };

if (orphanProns.c > 0) {
    findings.push({
        layer: 'DATABASE - PRONUNCIATIONS',
        severity: 'CRITICAL',
        issue: `Có ${orphanProns.c} phát âm mồ côi (word_id không tồn tại trong words)`,
        details: null
    });
}

// 2.2. IPA dị dạng (rỗng, chỉ có //, [], có dấu hỏi, có html, hoặc không bọc /.../ hay [...])
const malformedProns = db.prepare(`
    SELECT p.id, w.word, w.lang_code, p.ipa, p.region 
    FROM pronunciations p 
    JOIN words w ON p.word_id = w.id 
    WHERE trim(p.ipa) IN ('', '//', '[]', '/', '[-] ', 'nan', 'undefined', 'null')
       OR p.ipa LIKE '%<%>%'
       OR p.ipa LIKE '%?%'
       OR p.ipa LIKE '%\ufffd%'
       OR (p.ipa NOT LIKE '/%/' AND p.ipa NOT LIKE '[%]')
`).all();

if (malformedProns.length > 0) {
    findings.push({
        layer: 'DATABASE - PRONUNCIATIONS',
        severity: 'CRITICAL',
        issue: `Có ${malformedProns.length} phát âm chưa chuẩn định dạng (không bọc /.../ hoặc chứa ký tự lạ)`,
        details: malformedProns.slice(0, 10)
    });
}

// 2.3. Trùng lặp phát âm
const dupeProns = db.prepare(`
    SELECT word_id, ipa, region, count(*) as c 
    FROM pronunciations 
    GROUP BY word_id, ipa, region 
    HAVING c > 1
`).all();

if (dupeProns.length > 0) {
    findings.push({
        layer: 'DATABASE - PRONUNCIATIONS',
        severity: 'WARNING',
        issue: `Có ${dupeProns.length} phát âm bị trùng lặp chính xác (word_id, ipa, region)`,
        details: dupeProns.slice(0, 10)
    });
}

// =============================================================================
// 3. KIỂM TRA BẢNG DEFINITIONS & WORD_DEFINITIONS
// =============================================================================
console.log('3️⃣  Đang kiểm tra bảng DEFINITIONS & WORD_DEFINITIONS...');

// 3.1. Bản ghi liên kết mồ côi
const orphanWd = db.prepare(`
    SELECT count(*) as c 
    FROM word_definitions wd 
    LEFT JOIN words w ON wd.word_id = w.id 
    LEFT JOIN definitions d ON wd.definition_id = d.id 
    WHERE w.id IS NULL OR d.id IS NULL
`).get() as { c: number };

if (orphanWd.c > 0) {
    findings.push({
        layer: 'DATABASE - DEFINITIONS',
        severity: 'CRITICAL',
        issue: `Có ${orphanWd.c} liên kết mồ côi trong word_definitions`,
        details: null
    });
}

// 3.2. Định nghĩa chứa thẻ HTML chưa bóc tách
const htmlInDefs = db.prepare(`
    SELECT d.id, substr(d.definition, 1, 80) as snippet 
    FROM definitions d 
    WHERE d.definition LIKE '%<div%' 
       OR d.definition LIKE '%<span%' 
       OR d.definition LIKE '%<p>%' 
       OR d.definition LIKE '%<a href%'
`).all();

if (htmlInDefs.length > 0) {
    findings.push({
        layer: 'DATABASE - DEFINITIONS',
        severity: 'WARNING',
        issue: `Có ${htmlInDefs.length} định nghĩa chứa thẻ HTML thô`,
        details: htmlInDefs.slice(0, 10)
    });
}

// 3.3. Định nghĩa chứa HTML entities chưa decode (&amp;, &quot;, &lt;, &gt;, &#39;)
const htmlEntities = db.prepare(`
    SELECT d.id, substr(d.definition, 1, 80) as snippet 
    FROM definitions d 
    WHERE d.definition LIKE '%&quot;%' 
       OR d.definition LIKE '%&amp;%' 
       OR d.definition LIKE '%&lt;%' 
       OR d.definition LIKE '%&gt;%' 
       OR d.definition LIKE '%&#39;%'
`).all();

if (htmlEntities.length > 0) {
    findings.push({
        layer: 'DATABASE - DEFINITIONS',
        severity: 'WARNING',
        issue: `Có ${htmlEntities.length} định nghĩa chứa thực thể HTML chưa giải mã (&quot;, &amp;,...)`,
        details: htmlEntities.slice(0, 10)
    });
}

// 3.4. Định nghĩa rác hoặc chỉ là dấu câu đơn lẻ
const junkDefs = db.prepare(`
    SELECT d.id, d.definition, d.pos 
    FROM definitions d 
    WHERE trim(d.definition) IN (':', '.', '-', '--', '...', ',', '?', ';', 'null', 'undefined')
`).all();

if (junkDefs.length > 0) {
    findings.push({
        layer: 'DATABASE - DEFINITIONS',
        severity: 'CRITICAL',
        issue: `Có ${junkDefs.length} định nghĩa rác/dấu câu đơn lẻ`,
        details: junkDefs.slice(0, 10)
    });
}

// =============================================================================
// 4. KIỂM TRA BẢNG WORD_RELATIONS
// =============================================================================
console.log('4️⃣  Đang kiểm tra bảng WORD_RELATIONS...');

// 4.1. Bản ghi mồ côi
const orphanRels = db.prepare(`
    SELECT count(*) as c 
    FROM word_relations wr 
    LEFT JOIN words w ON wr.word_id = w.id 
    WHERE w.id IS NULL
`).get() as { c: number };

if (orphanRels.c > 0) {
    findings.push({
        layer: 'DATABASE - RELATIONS',
        severity: 'CRITICAL',
        issue: `Có ${orphanRels.c} quan hệ mồ côi trong word_relations`,
        details: null
    });
}

// 4.2. Relation_type lạ / không chuẩn
const standardTypes = new Set(['s', 'a', 'd', 'r', 'g', 'synonym', 'antonym']);
const allTypes = db.prepare('SELECT relation_type, count(*) as c FROM word_relations GROUP BY relation_type').all() as { relation_type: string; c: number }[];
for (const t of allTypes) {
    if (!standardTypes.has(t.relation_type)) {
        findings.push({
            layer: 'DATABASE - RELATIONS',
            severity: 'WARNING',
            issue: `Phát hiện relation_type bất thường: '${t.relation_type}' (${t.c} bản ghi)`,
            details: null
        });
    }
}

// 4.3. Quan hệ tự trỏ vào chính mình (word == related_word)
const selfRels = db.prepare(`
    SELECT w.word, wr.relation_type, wr.related_word 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE lower(trim(w.word)) = lower(trim(wr.related_word))
`).all();

if (selfRels.length > 0) {
    findings.push({
        layer: 'DATABASE - RELATIONS',
        severity: 'CRITICAL',
        issue: `Có ${selfRels.length} quan hệ tự trỏ vào chính nó`,
        details: selfRels.slice(0, 10)
    });
}

// 4.4. related_word có chứa # (ngoại trừ tên ngôn ngữ lập trình c#)
const hashRels = db.prepare(`
    SELECT w.word, wr.relation_type, wr.related_word 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE wr.related_word LIKE '%#%' AND lower(wr.related_word) != 'c#'
`).all();

if (hashRels.length > 0) {
    findings.push({
        layer: 'DATABASE - RELATIONS',
        severity: 'CRITICAL',
        issue: `Có ${hashRels.length} quan hệ chứa ký tự '#' chưa được bóc tách`,
        details: hashRels.slice(0, 10)
    });
}

// 4.5. Kiểm tra vòng lặp hai chiều A -> B và B -> A trong 'g' (Gốc từ)
const allG = db.prepare(`
    SELECT lower(w.word) as word, lower(wr.related_word) as root 
    FROM word_relations wr 
    JOIN words w ON wr.word_id = w.id 
    WHERE wr.relation_type IN ('g', 'Gốc từ')
`).all() as { word: string; root: string }[];

const rootMap = new Map<string, Set<string>>();
for (const r of allG) {
    if (!rootMap.has(r.word)) rootMap.set(r.word, new Set());
    rootMap.get(r.word)!.add(r.root);
}
let cyclicCount = 0;
const cyclicSamples: any[] = [];
for (const [word, roots] of rootMap.entries()) {
    for (const root of roots) {
        if (word < root && rootMap.get(root)?.has(word)) {
            cyclicCount++;
            if (cyclicSamples.length < 10) cyclicSamples.push({ word_a: word, word_b: root });
        }
    }
}
if (cyclicCount > 0) {
    findings.push({
        layer: 'DATABASE - RELATIONS',
        severity: 'CRITICAL',
        issue: `Phát hiện ${cyclicCount} cặp quan hệ vòng lặp gốc từ 2 chiều (A là gốc của B và ngược lại)`,
        details: cyclicSamples
    });
}

// =============================================================================
// 5. KIỂM TRA BẢNG TRANSLATIONS
// =============================================================================
console.log('5️⃣  Đang kiểm tra bảng TRANSLATIONS...');

// 5.1. Bản ghi mồ côi
const orphanTrans = db.prepare(`
    SELECT count(*) as c 
    FROM translations t 
    LEFT JOIN words w ON t.word_id = w.id 
    WHERE w.id IS NULL
`).get() as { c: number };

if (orphanTrans.c > 0) {
    findings.push({
        layer: 'DATABASE - TRANSLATIONS',
        severity: 'CRITICAL',
        issue: `Có ${orphanTrans.c} bản dịch mồ côi (word_id không tồn tại trong words)`,
        details: null
    });
}

// 5.2. Bản dịch rỗng
const emptyTrans = db.prepare(`
    SELECT t.id, w.word, t.lang_code, t.translation 
    FROM translations t 
    JOIN words w ON t.word_id = w.id 
    WHERE trim(t.translation) = ''
`).all();

if (emptyTrans.length > 0) {
    findings.push({
        layer: 'DATABASE - TRANSLATIONS',
        severity: 'CRITICAL',
        issue: `Có ${emptyTrans.length} bản dịch rỗng trong bảng translations`,
        details: emptyTrans.slice(0, 10)
    });
}

// =============================================================================
// 6. KIỂM TRA ENGINE TRA CỨU RUNTIME TRÊN TẬP HỢP ĐA DẠNG (100+ CASES)
// =============================================================================
console.log('6️⃣  Đang kiểm tra Lookup Engine trên các trường hợp biên và thực tế...');

const engineTestSuites = [
    // A. Latin homonyms: Dual-language words must prioritize English at results[0]
    {
        name: 'Latin Homonyms Prioritize English',
        words: ['go', 'run', 'can', 'do', 'in', 'on', 'at', 'to', 'by', 'for', 'be', 'say', 'may', 'see', 'hotel', 'bank', 'game', 'code', 'account', 'radio'],
        check: (res: any, w: string) => {
            const top = res.results[0];
            if (!top || top.lang_code !== 'en') return `Từ '${w}' không ưu tiên tiếng Anh ở results[0] (topLang: ${top?.lang_code})`;
            if (!top.pronunciations || top.pronunciations.length === 0) return `Từ '${w}' thiếu phát âm ở results[0]`;
            return null;
        }
    },
    // B. Irregular Verbs: Past & Participle forms must resolve root word
    {
        name: 'Irregular Verbs Root Resolution',
        words: ['went', 'gone', 'did', 'done', 'was', 'were', 'been', 'had', 'said', 'made', 'took', 'taken', 'came', 'saw', 'seen', 'knew', 'known', 'gotten', 'gave', 'given', 'sang', 'sung', 'rang', 'rung', 'swam', 'swum', 'wrote', 'written', 'flew', 'flown'],
        check: (res: any, w: string) => {
            const top = res.results[0];
            if (!top) return `Từ '${w}' không có kết quả`;
            const hasRoot = top.relations?.some((r: any) => r.relation_type === 'Gốc từ' || r.relation_type === 'g');
            if (!hasRoot && !top.rootWord && !top.root_word) return `Từ bất quy tắc '${w}' không nhận diện được gốc từ`;
            return null;
        }
    },
    // C. Contractions
    {
        name: 'Contractions & Informal Words',
        words: ["don't", "can't", "won't", "it's", "he's", "they're", "we've", "i'm", "gonna", "wanna", "gotta", "ain't"],
        check: (res: any, w: string) => {
            if (!res.exists || !res.results || res.results.length === 0) return `Không nhận diện được từ viết tắt '${w}'`;
            return null;
        }
    },
    // D. Loanwords & Accented English
    {
        name: 'Loanwords & Accented English Words',
        words: ['café', 'cliché', 'fiancé', 'château', 'pâté', 'résumé'],
        check: (res: any, w: string) => {
            if (!res.exists || !res.results || res.results.length === 0) return `Không tra cứu được từ mượn '${w}'`;
            const top = res.results[0];
            if (!top.meanings || top.meanings.length === 0) return `Từ mượn '${w}' thiếu định nghĩa`;
            return null;
        }
    },
    // E. Vietnamese Accents & Tone Mark Normalization
    {
        name: 'Vietnamese Words & Variations',
        words: ['học sinh', 'giáo viên', 'hòa bình', 'hoà bình', 'thủy triều', 'thuỷ triều', 'hà nội', 'đà nẵng', 'hồ chí minh'],
        check: (res: any, w: string) => {
            if (!res.exists || !res.results || res.results.length === 0) return `Từ tiếng Việt '${w}' không tra cứu được`;
            return null;
        }
    },
    // F. Inflected forms (-ing, -ed, -s/es, -ly, -er, -est, -ment, -ness)
    {
        name: 'Inflected & Derived Forms',
        words: ['displaying', 'programming', 'happily', 'quickly', 'happiness', 'darkness', 'development', 'teacher', 'cleaner', 'hardest', 'faster'],
        check: (res: any, w: string) => {
            const top = res.results[0];
            if (!top) return `Từ phái sinh '${w}' không có kết quả`;
            if (!top.pronunciations || top.pronunciations.length === 0) return `Từ phái sinh '${w}' thiếu phát âm`;
            return null;
        }
    },
    // G. Case Insensitivity
    {
        name: 'Case Insensitivity',
        words: ['English', 'VIETNAM', 'Apple', 'GOOGLE', 'pH', 'USA', 'Cat'],
        check: (res: any, w: string) => {
            if (!res.exists || !res.results || res.results.length === 0) return `Tra cứu không phân biệt hoa thường thất bại trên '${w}'`;
            return null;
        }
    }
];

for (const suite of engineTestSuites) {
    const suiteErrors: string[] = [];
    for (const w of suite.words) {
        try {
            const res = lookupWordSync(w);
            const err = suite.check(res, w);
            if (err) suiteErrors.push(err);
        } catch (e: any) {
            suiteErrors.push(`Lỗi Exception khi tra '${w}': ${e.message}`);
        }
    }
    if (suiteErrors.length > 0) {
        findings.push({
            layer: 'ENGINE - LOOKUP LOGIC',
            severity: 'CRITICAL',
            issue: `Bộ kiểm tra '${suite.name}' phát hiện ${suiteErrors.length} lỗi`,
            details: suiteErrors
        });
    } else {
        console.log(`   ✅ Suite '${suite.name}': PASS (${suite.words.length}/${suite.words.length} cases)`);
    }
}

// =============================================================================
// BÁO CÁO TỔNG KẾT
// =============================================================================
console.log('\n================================================================');
console.log('📊 KẾT QUẢ KIỂM TRA TOÀN DIỆN (ULTRA AUDIT REPORT)');
console.log('================================================================\n');

const criticals = findings.filter(f => f.severity === 'CRITICAL');
const warnings = findings.filter(f => f.severity === 'WARNING');
const infos = findings.filter(f => f.severity === 'INFO');

console.log(`🔴 Lỗi nghiêm trọng (CRITICAL): ${criticals.length}`);
console.log(`🟡 Cảnh báo cần tối ưu (WARNING): ${warnings.length}`);
console.log(`🔵 Thông tin (INFO): ${infos.length}\n`);

if (findings.length === 0) {
    console.log('🎉 XUẤT SẮC! Hệ thống cơ sở dữ liệu và Engine tra cứu đạt chuẩn 100%!');
} else {
    for (let i = 0; i < findings.length; i++) {
        const f = findings[i];
        console.log(`[${i + 1}] [${f.severity}] [${f.layer}]`);
        console.log(`    Vấn đề: ${f.issue}`);
        if (f.details) {
            console.log(`    Chi tiết:`, typeof f.details === 'string' ? f.details : JSON.stringify(f.details, null, 2));
        }
        console.log('');
    }
}

db.close();
