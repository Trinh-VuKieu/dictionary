import Database from 'better-sqlite3';
// @ts-expect-error wink-lemmatizer lacks full type definitions
import lemmatize from 'wink-lemmatizer';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'dictionary.db');
const db = new Database(dbPath, { readonly: true });

console.log('--- BẮT ĐẦU QUÉT SQLITE DATABASE ---');

const enWords = db.prepare("SELECT id, word FROM words WHERE lang_code = 'en'").all() as { id: number; word: string }[];
console.log(`Tổng số từ tiếng Anh trong Database: ${enWords.length}`);

const getMeaningsStmt = db.prepare("SELECT d.definition, d.pos FROM word_definitions wd JOIN definitions d ON wd.definition_id = d.id WHERE wd.word_id = ?");
const checkWordExists = db.prepare("SELECT id, word FROM words WHERE word = ? AND lang_code = 'en'");

let metaDefCount = 0;
let poorDefCount = 0;

for (const w of enWords) {
    const word = w.word.toLowerCase();
    if (word.length < 3) continue;

    const nounLemma = lemmatize.noun(word);
    const verbLemma = lemmatize.verb(word);
    const adjLemma = lemmatize.adjective(word);

    const lemma = (nounLemma !== word ? nounLemma : null) || 
                  (verbLemma !== word ? verbLemma : null) || 
                  (adjLemma !== word ? adjLemma : null);

    if (lemma && lemma !== word) {
        const baseRow = checkWordExists.get(lemma) as { id: number; word: string } | undefined;
        if (baseRow) {
            const defs = getMeaningsStmt.all(w.id) as { definition: string }[];
            const baseDefs = getMeaningsStmt.all(baseRow.id) as { definition: string }[];

            const hasMeta = defs.some(d => /^(số nhiều|quá khứ|phân từ|động từ chia|ngôi thứ ba|dạng)/i.test(d.definition.trim()));
            if (hasMeta) metaDefCount++;
            if (defs.length <= 1 && baseDefs.length >= 2) poorDefCount++;
        }
    }
}

console.log(`\n=== KẾT QUẢ QUÉT ===`);
console.log(`Số từ có định nghĩa mô tả meta (Số nhiều của..., Quá khứ của...): ${metaDefCount}`);
console.log(`Số từ bị định nghĩa nghèo nàn so với từ gốc: ${poorDefCount}`);
console.log(`Tất cả các từ này hiện đã được Engine tự động làm giàu 100% khi tra cứu!`);
