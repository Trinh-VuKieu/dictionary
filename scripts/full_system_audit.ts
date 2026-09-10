import Database from 'better-sqlite3';
import { lookupWordSync } from '../lib/dictionary';
// @ts-expect-error wink-lemmatizer lacks types
import lemmatize from 'wink-lemmatizer';

const db = new Database('lib/dictionary.db');

console.log('=== BẮT ĐẦU QUÉT TOÀN DIỆN HỆ THỐNG TỪ ĐIỂN ===\n');

// 1. TỔNG QUAN CƠ SỞ DỮ LIỆU
const wordCount = db.prepare('SELECT count(*) as c FROM words').get() as { c: number };
const wordsByLang = db.prepare('SELECT lang_code, count(*) as c FROM words GROUP BY lang_code ORDER BY c DESC').all() as { lang_code: string; c: number }[];
console.log(`1. Tổng số từ: ${wordCount.c} từ across ${wordsByLang.length} ngôn ngữ`);
console.log('   - Top 5 ngôn ngữ:', wordsByLang.slice(0, 5).map(l => `${l.lang_code}: ${l.c}`).join(', '));

// 2. KIỂM TRA TỪ CÓ 0 ĐỊNH NGHĨA
console.log('\n2. Kiểm tra từ có 0 định nghĩa (Không có bản ghi trong word_definitions):');
const zeroDefByLang = db.prepare(`
    SELECT w.lang_code, count(*) as c 
    FROM words w 
    LEFT JOIN word_definitions wd ON w.id = wd.word_id 
    WHERE wd.id IS NULL 
    GROUP BY w.lang_code 
    ORDER BY c DESC
`).all() as { lang_code: string; c: number }[];
console.table(zeroDefByLang);

// 3. KIỂM TRA TỪ CÓ ĐỊNH NGHĨA RỖNG HOẶC CHỈ CÓ DẤU CHẤM
console.log('\n3. Kiểm tra định nghĩa rác/rỗng:');
const junkDefs = db.prepare(`
    SELECT count(*) as c 
    FROM definitions 
    WHERE trim(definition) = '' OR trim(definition) = '.' OR trim(definition) = '-' OR length(trim(definition)) = 0
`).get() as { c: number };
console.log(`   - Định nghĩa rác/rỗng trong bảng definitions: ${junkDefs.c}`);

// 4. KIỂM TRA PHÁT ÂM (PRONUNCIATIONS)
console.log('\n4. Kiểm tra phát âm tiếng Anh trong DB:');
const enWordsWithoutDbPron = db.prepare(`
    SELECT count(*) as c 
    FROM words w 
    LEFT JOIN pronunciations p ON w.id = p.word_id 
    WHERE w.lang_code = 'en' AND p.id IS NULL
`).get() as { c: number };
console.log(`   - Số từ tiếng Anh không có bản ghi trong bảng pronunciations: ${enWordsWithoutDbPron.c}`);

// 5. KIỂM TRA QUAN HỆ TỪ (RELATIONS)
console.log('\n5. Kiểm tra quan hệ từ (word_relations):');
const totalRel = db.prepare('SELECT count(*) as c FROM word_relations').get() as { c: number };
const relTypes = db.prepare('SELECT relation_type, count(*) as c FROM word_relations GROUP BY relation_type ORDER BY c DESC').all() as { relation_type: string; c: number }[];
console.log(`   - Tổng số quan hệ: ${totalRel.c}`);
console.table(relTypes);

// 6. KIỂM TRA DỊCH NGHĨA (TRANSLATIONS)
console.log('\n6. Kiểm tra bảng translations:');
const totalTrans = db.prepare('SELECT count(*) as c FROM translations').get() as { c: number };
console.log(`   - Tổng số bản ghi translations: ${totalTrans.c}`);

// 7. KIỂM TRA THỨ TỰ NGÔN NGỮ (SHADOWING)
console.log('\n7. Kiểm tra từ tiếng Anh bị che lấp bởi ngôn ngữ khác khi tra cứu không truyền lang:');
const sampleWords = [
    'go', 'run', 'can', 'do', 'in', 'on', 'at', 'to', 'by', 'for', 'be', 'say', 'may', 'see',
    'account', 'hotel', 'radio', 'code', 'game', 'audio', 'video', 'music', 'tennis', 'film',
    'bank', 'bar', 'base', 'beer', 'block', 'bomb', 'box', 'bus', 'cake', 'camera', 'camp',
    'cap', 'car', 'card', 'case', 'club', 'coach', 'coffee', 'dance', 'date', 'gold', 'golf',
    'group', 'jazz', 'jeans', 'mail', 'menu', 'mini', 'model', 'motor', 'net', 'news', 'note',
    'page', 'park', 'party', 'pass', 'pen', 'phone', 'photo', 'piano', 'pin', 'pipe', 'plan',
    'plus', 'pop', 'post', 'ring', 'rock', 'round', 'set', 'show', 'size', 'skin', 'solo',
    'song', 'sport', 'stand', 'star', 'step', 'stop', 'style', 'super', 'tank', 'taxi', 'team',
    'test', 'tin', 'tip', 'tour', 'van', 'virus', 'visa', 'web', 'win', 'yard', 'yoga', 'zero',
    'zone', 'ran', 'sang', 'sung', 'rang', 'rung', 'hung', 'lung', 'dung', 'gang', 'tang', 'bang'
];

let shadowedCount = 0;
const shadowedSamples: { word: string; topLang: string; allLangs: string }[] = [];

for (const w of sampleWords) {
    const res = lookupWordSync(w);
    const topLang = res.results[0]?.lang_code;
    if (topLang && topLang !== 'en') {
        shadowedCount++;
        shadowedSamples.push({
            word: w,
            topLang,
            allLangs: res.results.map(r => r.lang_code).join(', ')
        });
    }
}
console.log(`   - Trong mẫu ${sampleWords.length} từ tiếng Anh phổ biến, số từ BỊ CHE LẤP (topLang !== 'en'): ${shadowedCount}/${sampleWords.length}`);

// 8. KIỂM TRA ĐỘNG TỪ BẤT QUY TẮC PHỔ BIẾN
console.log('\n8. Kiểm tra dạng quá khứ và phân từ của động từ bất quy tắc:');
const irregularVerbsList: [string, string][] = [
    ['went', 'go'], ['gone', 'go'], ['ran', 'run'], ['did', 'do'], ['done', 'do'],
    ['was', 'be'], ['were', 'be'], ['been', 'be'], ['had', 'have'], ['said', 'say'],
    ['made', 'make'], ['took', 'take'], ['taken', 'take'], ['came', 'come'],
    ['saw', 'see'], ['seen', 'see'], ['knew', 'know'], ['known', 'know'],
    ['got', 'get'], ['gotten', 'get'], ['gave', 'give'], ['given', 'give'],
    ['found', 'find'], ['thought', 'think'], ['told', 'tell'], ['felt', 'feel'],
    ['became', 'become'], ['left', 'leave'], ['put', 'put'], ['meant', 'mean'],
    ['kept', 'keep'], ['let', 'let'], ['began', 'begin'], ['begun', 'begin'],
    ['shown', 'show'], ['heard', 'hear'], ['held', 'hold'], ['brought', 'bring'],
    ['wrote', 'write'], ['written', 'write'], ['sat', 'sit'], ['stood', 'stand'],
    ['lost', 'lose'], ['paid', 'pay'], ['met', 'meet'], ['set', 'set'],
    ['learnt', 'learn'], ['led', 'lead'], ['understood', 'understand'],
    ['spoke', 'speak'], ['spoken', 'speak'], ['read', 'read'], ['spent', 'spend'],
    ['grew', 'grow'], ['grown', 'grow'], ['won', 'win'], ['bought', 'buy'],
    ['sent', 'send'], ['built', 'build'], ['fell', 'fall'], ['fallen', 'fall'],
    ['cut', 'cut'], ['sold', 'sell'], ['broke', 'break'], ['broken', 'break'],
    ['sang', 'sing'], ['sung', 'sing'], ['rang', 'ring'], ['rung', 'ring'],
    ['swam', 'swim'], ['swum', 'swim'], ['drove', 'drive'], ['driven', 'drive']
];

let missingIrregRoot = 0;
const missingIrregSamples: string[] = [];
for (const [form, inf] of irregularVerbsList) {
    const res = lookupWordSync(form);
    const topRes = res.results[0];
    const hasRoot = topRes?.relations?.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === inf.toLowerCase());
    if (!hasRoot) {
        missingIrregRoot++;
        missingIrregSamples.push(`${form} (cần gốc: ${inf}, topLang: ${topRes?.lang_code})`);
    }
}
console.log(`   - Trong ${irregularVerbsList.length} dạng bất quy tắc kiểm tra, số dạng THIẾU 'Gốc từ' ở results[0]: ${missingIrregRoot}`);
if (missingIrregSamples.length > 0) {
    console.log('   - Ví dụ dạng thiếu:', missingIrregSamples);
}

// 9. KIỂM TRA PHÁT ÂM VÀ TRANSLATIONS Ở RESULTS[0]
console.log('\n9. Kiểm tra phát âm và translations ở results[0] cho các từ tiếng Anh:');
let missingPronCount = 0;
let missingTransCount = 0;
for (const w of sampleWords) {
    const res = lookupWordSync(w);
    const top = res.results[0];
    if (!top || !top.pronunciations || top.pronunciations.length === 0) {
        missingPronCount++;
    }
    if (!top || !top.translations || top.translations.length === 0) {
        missingTransCount++;
    }
}
console.log(`   - Số từ results[0] THIẾU phát âm: ${missingPronCount}/${sampleWords.length}`);
console.log(`   - Số từ results[0] THIẾU translations: ${missingTransCount}/${sampleWords.length}`);

// 10. KIỂM TRA TIỀN TỐ VÀ HẬU TỐ
console.log('\n10. Kiểm tra từ phái sinh (tiền tố & hậu tố):');
const affixTestWords = [
    'unhappy', 'impossible', 'dislike', 'unable', 'rewrite', 'nonstop', 'misunderstand', 'overcook', 'underpay',
    'happiness', 'darkness', 'kindness', 'sadness',
    'careful', 'careless', 'hopeful', 'hopeless', 'useful', 'useless',
    'teacher', 'worker', 'player', 'driver', 'writer',
    'readable', 'comfortable', 'enjoyable',
    'development', 'movement', 'agreement',
    'action', 'direction', 'creation',
    'quickly', 'slowly', 'beautifully', 'easily'
];

let missingAffixRoot = 0;
const missingAffixSamples: string[] = [];
for (const w of affixTestWords) {
    const res = lookupWordSync(w);
    const topRes = res.results[0];
    const roots = topRes?.relations?.filter(r => r.relation_type === 'Gốc từ').map(r => r.related_word);
    if (!roots || roots.length === 0) {
        missingAffixRoot++;
        missingAffixSamples.push(`${w} (topLang: ${topRes?.lang_code})`);
    }
}
console.log(`   - Số từ phái sinh THIẾU 'Gốc từ' ở results[0]: ${missingAffixRoot}/${affixTestWords.length}`);
if (missingAffixSamples.length > 0) {
    console.log('   - Ví dụ thiếu gốc từ:', missingAffixSamples);
}

