/**
 * SQLite dictionary helper module
 * Optimized for Vercel serverless (read-only filesystem)
 * Supports multi-language dictionary lookups
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// POS labels
const POS_LABELS: Record<string, string> = {
    A: 'Tính từ',
    C: 'Liên từ',
    D: 'Phó từ',
    E: 'Giới từ',
    I: 'Tình thái từ',
    M: 'Lượng từ',
    N: 'Danh từ',
    O: 'Thán từ',
    P: 'Đại từ',
    R: 'Trạng từ',
    S: 'Từ đặc biệt',
    V: 'Động từ',
    X: 'Từ phụ trợ / khác',
    Z: 'Hậu tố'
};

// Sub POS labels
const SUB_POS_LABELS: Record<string, string> = {
    A: 'Tính từ nói chung',
    A0: 'Tính từ chỉ số lượng, trạng thái tổng quát',
    Ai: 'Tính từ chỉ khả năng, thuộc tính nội tại',
    Ao: 'Tính từ chỉ âm thanh, cảm giác',
    Ap: 'Tính từ phổ biến',
    Ar: 'Tính từ chỉ mức độ, cường độ',
    Ax: 'Tính từ đặc biệt',
    Vi: 'Động từ nội',
    Vm: 'Động từ phương pháp',
    Vs: 'Động từ không chuyển',
    Vt: 'Động từ chuyển',
    Vu: 'Động từ đặc biệt/thành ngữ',
    N: 'Danh từ nói chung',
    Na: 'Danh từ trừu tượng',
    Nc: 'Danh từ chỉ loại',
    Ng: 'Danh từ giống loài',
    Nl: 'Danh từ chỉ vị trí',
    Np: 'Danh từ riêng',
    Nt: 'Danh từ chỉ vật, hiện tượng',
    Nu: 'Danh từ đơn vị',
    Nx: 'Danh từ chuyên biệt',
    Pd: 'Đại từ chỉ định',
    Pi: 'Đại từ nhân xưng',
    Pp: 'Đại từ sở hữu',
    Pq: 'Đại từ nghi vấn',
    C: 'Liên từ',
    D: 'Phó từ',
    E: 'Giới từ',
    I: 'Thán từ',
    Mc: 'Lượng từ đơn vị',
    Mo: 'Lượng từ số lượng',
    O: 'Từ tình thái',
    R: 'Trạng từ',
    S: 'Từ đặc biệt',
    X: 'Tổ hợp từ đặc biệt',
    XX: 'Từ lỗi/dữ liệu không xác định',
    Z: 'Hậu tố'
};

// Relation labels
const RELATION_LABELS: Record<string, string> = {
    s: 'Đồng nghĩa',
    a: 'Trái nghĩa',
    d: 'Từ phái sinh',
    r: 'Liên quan',
    g: 'Gốc từ'
};

// Language labels - auto-generated from kaikki.org-dictionary-all.jsonl
import { LANG_LABELS } from './lang_labels';
import { getCustomWord, getCustomSuggestions } from './custom_words';
import { getContraction, getLemmas, getPossessive, getSpellingVariants, CONTRACTIONS } from './morphology';
import { parseNumberEntry, parseTimeEntry } from './number_time_engine';
import { VN_UNACCENTED_PLACES, getPlaceOrName, getPlacesSuggestions } from './places_and_names';
import { lookupWikiFallback } from './wiki_fallback';
import { lookupWiktionaryFallback } from './wiktionary_fallback';
import { getEnglishPhoneticFallback } from './english_phonetics';
import { getSynonymsAndAntonyms, getThesaurusEntry } from './synonyms_antonyms';




export interface DictionaryMeaning {
    definition: string;
    definition_lang: string;
    example: string | null;
    pos: string;
    sub_pos: string | null;
    source: string | null;
    links: string[];
}

export interface DictionaryPronunciation {
    ipa: string;
    phonetic?: string; // Alias tương thích cho các backend/client đọc trường phonetic
    region: string | null;
    audio?: string;
    audioUrl?: string; // Alias tương thích cho backend Java đọc audioUrl
}

export interface GroupedDefinition {
    definition: string;
    definitionVi?: string;
    example?: string | null;
}

export interface GroupedMeaning {
    partOfSpeech: string;
    part_of_speech?: string;
    pos?: string;
    definitions: GroupedDefinition[];
    synonyms: string[];
    antonyms: string[];
}

export interface DictionaryTranslation {
    lang_code: string;
    lang_name: string | null;
    translation: string;
}

export interface DictionaryRelation {
    related_word: string;
    relation_type: string;
}

// Single language result
export interface LanguageResult {
    lang_code: string;
    lang_name: string;
    word?: string;
    rootWord?: string | null; // Từ gốc nguyên thể (root word / lemma) nếu là dạng chia thì/biến thể (vd: "went" -> "go")
    root_word?: string | null;
    audio: string;
    meanings: DictionaryMeaning[];
    meaning_groups?: GroupedMeaning[];
    meaningGroups?: GroupedMeaning[];
    pronunciations: DictionaryPronunciation[];
    phonetics?: DictionaryPronunciation[]; // Alias tương thích cho backend Java
    translations: DictionaryTranslation[];
    relations: DictionaryRelation[];
    synonyms?: string[];
    antonyms?: string[];
}

// Multi-language lookup result
export interface MultiLookupResult {
    exists: boolean;
    word: string;
    rootWord?: string | null;
    root_word?: string | null;
    results: LanguageResult[];
}

// Legacy single result (for backward compatibility)
export interface LookupResult {
    exists: boolean;
    word?: string;
    lang_code?: string;
    lang_name?: string;
    audio?: string;
    meanings?: DictionaryMeaning[];
    pronunciations?: DictionaryPronunciation[];
    translations?: DictionaryTranslation[];
    relations?: DictionaryRelation[];
    synonyms?: string[];
    antonyms?: string[];
}

// Singleton database instance (lazy loaded)
let db: Database.Database | null = null;

function getDb(): Database.Database {
    if (!db) {
        const possiblePaths = [
            path.join(process.cwd(), 'lib', 'dictionary.db'),
            path.join(process.cwd(), '.next', 'standalone', 'lib', 'dictionary.db'),
            path.join(__dirname, '..', 'lib', 'dictionary.db'),
            path.join(__dirname, 'dictionary.db'),
            '/app/lib/dictionary.db'
        ];
        let dbPath = possiblePaths[0];
        for (const p of possiblePaths) {
            try {
                if (fs.existsSync(p)) {
                    dbPath = p;
                    break;
                }
            } catch {
                // ignore
            }
        }

        try {
            db = new Database(dbPath, {
                readonly: true,
                fileMustExist: true
            });

            db.pragma('query_only = ON');
            db.pragma('journal_mode = OFF');
            db.pragma('synchronous = OFF');
            db.pragma('cache_size = -32000');
            db.pragma('mmap_size = 256000000');
            db.pragma('temp_store = MEMORY');
            db.pragma('threads = 4');
        } catch (err) {
            console.error(`[DB ERROR] Failed to initialize SQLite database at ${dbPath}:`, err);
            throw err;
        }
    }
    return db;
}

// Prepared statements (lazy loaded)
let lookupAllLangsStmt: Database.Statement | null = null;
let lookupByLangStmt: Database.Statement | null = null;
let getMeaningsStmt: Database.Statement | null = null;

let getPronunciationsStmt: Database.Statement | null = null;
let getTranslationsStmt: Database.Statement | null = null;
let getRelationsStmt: Database.Statement | null = null;

function getStatements() {
    const database = getDb();

    if (!lookupAllLangsStmt) {
        lookupAllLangsStmt = database.prepare(`
            SELECT id, word, lang_code FROM words WHERE word = ? ORDER BY 
            CASE lang_code 
                WHEN 'vi' THEN 1 
                WHEN 'en' THEN 2 
                ELSE 3 
            END, lang_code
        `);
    }

    if (!lookupByLangStmt) {
        lookupByLangStmt = database.prepare(`
            SELECT id, word, lang_code FROM words WHERE word = ? AND lang_code = ?
        `);
    }

    if (!getMeaningsStmt) {
        getMeaningsStmt = database.prepare(`
            SELECT d.id as definition_id, d.definition, COALESCE(d.definition_lang, 'vi') as definition_lang, wd.example, d.pos, d.sub_pos, d.links, s.name as source
            FROM word_definitions wd
            JOIN definitions d ON wd.definition_id = d.id
            LEFT JOIN sources s ON wd.source_id = s.id
            WHERE wd.word_id = ?
        `);
    }



    if (!getPronunciationsStmt) {
        getPronunciationsStmt = database.prepare(`
            SELECT ipa, region FROM pronunciations WHERE word_id = ?
        `);
    }

    if (!getTranslationsStmt) {
        getTranslationsStmt = database.prepare(`
            SELECT lang_code, translation FROM translations WHERE word_id = ?
        `);
    }

    if (!getRelationsStmt) {
        getRelationsStmt = database.prepare(`
            SELECT related_word, relation_type FROM word_relations WHERE word_id = ?
        `);
    }

    return {
        lookupAllLangsStmt,
        lookupByLangStmt,
        getMeaningsStmt,

        getPronunciationsStmt,
        getTranslationsStmt,
        getRelationsStmt
    };
}

/**
 * Chuyển từ tiếng Anh chuẩn sang dạng bị lưu sai trong database gốc (SQLite):
 * 1. qui -> quy (quick -> quyck, quiet -> quyet, liquid -> liquyd, require -> requyre)
 * 2. [hklmst]y ở cuối từ -> [hklmst]i (usually -> usualli, family -> famili, city -> citi, party -> parti)
 */
function toDbEnglishVariant(str: string): string {
    return str.toLowerCase().split(' ').map(w => {
        let res = w;
        if (res.includes('qui')) {
            res = res.replace(/qui/g, 'quy');
        }
        if (/(?:[hklmst])y$/i.test(res)) {
            res = res.slice(0, -1) + 'i';
        }
        return res;
    }).join(' ');
}

function isEnglishDbVariant(dbWord: string, originalWord: string): boolean {
    if (!dbWord || !originalWord) return false;
    const dbLower = dbWord.toLowerCase();
    const origLower = originalWord.toLowerCase();
    if (dbLower === origLower) return true;
    return toDbEnglishVariant(origLower) === dbLower;
}

/**
 * Phục hồi các từ tiếng Anh bị lưu sai trong database gốc:
 * 1. quy -> qui (quyck -> quick, quyet -> quiet, requyre -> require, liquyd -> liquid, squyd -> squid)
 * 2. [hklmst]i ở cuối từ -> [hklmst]y (usualli -> usually, famili -> family, citi -> city, parti -> party, onli -> only)
 */
function demangleEnglishWord(w: string): string {
    if (!w) return '';
    let res = w;
    // Phục hồi qui từ quy trong tiếng Anh
    res = res.replace(/quy/g, 'qui');

    // Phục hồi đuôi -y từ -i
    const legitI = new Set([
        'chili', 'chilli', 'broccoli', 'graffiti', 'macaroni', 'spaghetti', 'swahili',
        'salami', 'tsunami', 'origami', 'yogi', 'corgi', 'alkali', 'alibi', 'bikini',
        'zucchini', 'cacti', 'fungi', 'radii', 'termini', 'octopi', 'alumni', 'hippopotami', 'syllabus'
    ]);
    return res.split(' ').map(part => {
        if (/(?:[hklmst])i$/i.test(part) && !legitI.has(part.toLowerCase())) {
            return part.slice(0, -1) + 'y';
        }
        return part;
    }).join(' ');
}

function normalizeVietnamese(text: string): string {
    if (!text) return '';

    let result = text;

    // Chỉ chuẩn hóa y -> i cho các từ/âm tiết đơn lập tiếng Việt (đứng đầu chuỗi hoặc sau dấu cách)
    // Tuyệt đối không can thiệp vào các từ tiếng Anh có đuôi -ly, -ty, -my, -sy... (như usually, ussually, family, city, only...)
    result = result.replace(/(?<=^|\s)([hklst])y(?=\s|$|[.,!?])/g, '$1i')
        .replace(/(?<=^|\s)([hklmst])ỳ(?=\s|$|[.,!?])/g, '$1ì')
        .replace(/(?<=^|\s)([hklmst])ý(?=\s|$|[.,!?])/g, '$1í')
        .replace(/(?<=^|\s)([hklmst])ỷ(?=\s|$|[.,!?])/g, '$1ỉ')
        .replace(/(?<=^|\s)([hklmst])ỹ(?=\s|$|[.,!?])/g, '$1ĩ')
        .replace(/(?<=^|\s)([hklmst])ỵ(?=\s|$|[.,!?])/g, '$1ị');

    // Chỉ chuẩn hóa qui -> quy cho âm tiết đơn lập tiếng Việt (đầu chuỗi hoặc sau dấu cách)
    // Tuyệt đối không can thiệp vào các từ tiếng Anh có chứa qui (như quick, quiet, quite, liquid, require, acquire...)
    result = result.replace(/(?<=^|\s)qui(?=\s|$|[.,!?])/g, 'quy')
        .replace(/(?<=^|\s)quì(?=\s|$|[.,!?])/g, 'quỳ')
        .replace(/(?<=^|\s)quí(?=\s|$|[.,!?])/g, 'quý')
        .replace(/(?<=^|\s)quỉ(?=\s|$|[.,!?])/g, 'quỷ')
        .replace(/(?<=^|\s)quĩ(?=\s|$|[.,!?])/g, 'quỹ')
        .replace(/(?<=^|\s)quị(?=\s|$|[.,!?])/g, 'quỵ');

    if (/[ùúủũụòóỏõọ]/.test(result)) {
        result = result.replace(/ùy/g, 'uỳ').replace(/úy/g, 'uý').replace(/ủy/g, 'uỷ').replace(/ũy/g, 'uỹ').replace(/ụy/g, 'uỵ')
            .replace(/òa/g, 'oà').replace(/óa/g, 'oá').replace(/ỏa/g, 'oả').replace(/õa/g, 'oã').replace(/ọa/g, 'oạ')
            .replace(/òe/g, 'oè').replace(/óe/g, 'oé').replace(/ỏe/g, 'oẻ').replace(/õe/g, 'oẽ').replace(/ọe/g, 'oẹ');
    }

    return result;
}

function sanitizeDefinition(rawDef: string): string {
    if (!rawDef) return '';
    let text = rawDef.trim();

    // 1. Loại bỏ các template rác wiktionary chưa dịch hoặc placeholder
    if (text.includes('{{rfdef}}') || text.includes('{{#switch:')) {
        return '';
    }

    // 2. Chuyển đổi các nhãn chuyên ngành Wiktionary sang dạng chú thích tiếng Việt rõ ràng
    text = text
        .replace(/\[\[thgt><đùa\|Thgt><đùa\]\]/gi, '(Thông tục, đùa)')
        .replace(/\[\[Mỹ><thgt\]\]/gi, '(Mỹ, thông tục)')
        .replace(/\[\[(?:<động>\|<động>|<động>)\]\]/gi, '(Động vật học)')
        .replace(/\[\[(?:<đùa>\|<đùa>|<đùa>)\]\]/gi, '(Đùa)')
        .replace(/<động>/gi, '(Động vật học)')
        .replace(/<địa>/gi, '(Địa chất học)')
        .replace(/<thgt>/gi, '(Thông tục)')
        .replace(/<toán>/gi, '(Toán học)')
        .replace(/<y>/gi, '(Y học)');

    // 3. Loại bỏ wiki links rỗng [[|]] hoặc [[]]
    text = text.replace(/\[\[\|\]\]/g, '').replace(/\[\[\]\]/g, '');

    // 4. Giải mã cú pháp [[link|text]] -> text, [[link]] -> link
    text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
    text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');

    // 5. Loại bỏ các template {{...}} còn sót lại
    text = text.replace(/\{\{[^}]+\}\}/g, '');

    // 6. Chuẩn hóa khoảng trắng
    text = text.replace(/\s+/g, ' ').trim();

    // 7. Lọc bỏ nếu chỉ là ký tự đặc biệt hoặc dấu chấm đơn lẻ
    if (/^[.,;:!?'"_\-\s]+$/.test(text)) {
        return '';
    }

    return text;
}

/**
 * Chuẩn hóa chuỗi IPA: luôn đảm bảo bắt đầu bằng '/' và kết thúc bằng '/'
 */
export function cleanIpa(raw: string | null | undefined, fallbackWord?: string): string {
    if (!raw || !raw.trim()) {
        return fallbackWord ? `/${fallbackWord.trim()}/` : '//';
    }
    const s = raw.trim().replace(/^\/+|\/+$/g, '').trim();
    if (!s) {
        return fallbackWord ? `/${fallbackWord.trim()}/` : '//';
    }
    return `/${s}/`;
}

/**
 * Chuẩn hóa phiên âm tiếng Anh luôn trả về ĐÚNG 2 mục: US và UK kèm audio riêng biệt cho mỗi giọng
 */
export function formatUsUkPronunciations(
    wordText: string,
    rawPronunciations?: DictionaryPronunciation[]
): DictionaryPronunciation[] {
    const cleanWord = wordText.toLowerCase().trim();

    // Nếu là chữ số thuần túy (0-20...), chuyển sang phát âm tiếng Anh tương ứng (0 -> zero, 1 -> one, 4 -> four...)
    if (/^\d+$/.test(cleanWord)) {
        const num = parseInt(cleanWord, 10);
        if (num >= 0 && num <= 20) {
            const numWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
            const wordEquiv = numWords[num];
            return formatUsUkPronunciations(wordEquiv);
        }
    }

    const usAudio = `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=en&accent=us`;
    const ukAudio = `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=en&accent=uk`;

    let usIpa: string | null = null;
    let ukIpa: string | null = null;

    // 1. Kiểm tra từ điển phiên âm chuẩn tĩnh trước (ENGLISH_PHONETICS_MAP)
    const mapFallback = getEnglishPhoneticFallback(cleanWord);
    if (mapFallback && mapFallback.length > 0) {
        const usFound = mapFallback.find(p => p.region === 'US' || p.region?.includes('US'));
        const ukFound = mapFallback.find(p => p.region === 'UK' || p.region?.includes('UK'));
        if (usFound) usIpa = usFound.ipa;
        if (ukFound) ukIpa = ukFound.ipa;
    }

    // 2. Tìm trong rawPronunciations từ SQLite
    if ((!usIpa || !ukIpa) && rawPronunciations && rawPronunciations.length > 0) {
        for (const p of rawPronunciations) {
            const reg = (p.region || '').toLowerCase();
            const ipa = p.ipa;

            // Nhận diện US qua region hoặc đặc trưng nguyên âm US (oʊ, GA, American)
            if (!usIpa && (reg.includes('us') || reg.includes('american') || reg.includes('ga') || ipa.includes('oʊ'))) {
                usIpa = ipa;
            }
            // Nhận diện UK qua region hoặc đặc trưng nguyên âm UK (Received, RP, British, əʊ, ɒ)
            if (!ukIpa && (reg.includes('uk') || reg.includes('received') || reg.includes('rp') || reg.includes('british') || ipa.includes('əʊ') || ipa.includes('ɒ'))) {
                ukIpa = ipa;
            }
        }

        // Tách theo đặc trưng /æ/ (US) vs /ɑː/ (UK) (như class, pass, dance, ask, bath, fast)
        if (!usIpa || !ukIpa) {
            for (const p of rawPronunciations) {
                if (!usIpa && p.ipa.includes('æ') && !p.ipa.includes('ɑː')) {
                    usIpa = p.ipa;
                }
                if (!ukIpa && p.ipa.includes('ɑː') && !p.ipa.includes('æ')) {
                    ukIpa = p.ipa;
                }
            }
        }

        const availableIpas = rawPronunciations.map(p => p.ipa).filter(Boolean);
        if (availableIpas.length > 0) {
            if (!usIpa && !ukIpa) {
                if (availableIpas.length >= 2 && availableIpas[0] !== availableIpas[1]) {
                    if (availableIpas[0].includes('ɑː') || availableIpas[0].includes('ɒ')) {
                        ukIpa = availableIpas[0];
                        usIpa = availableIpas[1];
                    } else if (availableIpas[1].includes('ɑː') || availableIpas[1].includes('ɒ')) {
                        ukIpa = availableIpas[1];
                        usIpa = availableIpas[0];
                    } else {
                        usIpa = availableIpas[0];
                        ukIpa = availableIpas[1];
                    }
                } else {
                    usIpa = availableIpas[0];
                    ukIpa = availableIpas[0];
                }
            } else if (!usIpa && ukIpa) {
                const other = availableIpas.find(ipa => ipa !== ukIpa);
                usIpa = other || ukIpa;
            } else if (usIpa && !ukIpa) {
                const other = availableIpas.find(ipa => ipa !== usIpa);
                ukIpa = other || usIpa;
            }
        }
    }

    // 3. Nếu vẫn thiếu một trong 2 hoặc cả hai, thử tìm theo từ gốc (base lemma)
    if (!usIpa || !ukIpa) {
        const lemmas = getLemmas(cleanWord);
        for (const item of lemmas) {
            if (item.lemma.toLowerCase() === cleanWord) continue;
            const baseFallback = getEnglishPhoneticFallback(item.lemma);
            if (baseFallback && baseFallback.length > 0) {
                const usFound = baseFallback.find(p => p.region === 'US' || p.region?.includes('US'));
                const ukFound = baseFallback.find(p => p.region === 'UK' || p.region?.includes('UK'));
                if (!usIpa && usFound) usIpa = usFound.ipa;
                if (!ukIpa && ukFound) ukIpa = ukFound.ipa;
            }
        }
    }

    const finalUsIpa = cleanIpa(usIpa, cleanWord);
    const finalUkIpa = cleanIpa(ukIpa || usIpa, cleanWord);

    return [
        {
            region: 'US',
            ipa: finalUsIpa,
            phonetic: finalUsIpa,
            audio: usAudio,
            audioUrl: usAudio
        },
        {
            region: 'UK',
            ipa: finalUkIpa,
            phonetic: finalUkIpa,
            audio: ukAudio,
            audioUrl: ukAudio
        }
    ];
}

export function normalizePartOfSpeech(pos: string | null | undefined): string {
    if (!pos) return 'other';
    const trimmed = pos.trim();
    const lower = trimmed.toLowerCase();

    if (lower === 'v' || lower === 'verb' || lower.includes('động từ')) return 'verb';
    if (lower === 'n' || lower === 'noun' || lower.includes('danh từ')) return 'noun';
    if (lower === 'a' || lower === 'adj' || lower === 'adjective' || lower.includes('tính từ')) return 'adjective';
    if (lower === 'd' || lower === 'r' || lower === 'adv' || lower === 'adverb' || lower.includes('phó từ') || lower.includes('trạng từ')) return 'adverb';
    if (lower === 'p' || lower === 'prep' || lower === 'preposition' || lower.includes('giới từ')) return 'preposition';
    if (lower === 'c' || lower === 'conj' || lower === 'conjunction' || lower.includes('liên từ')) return 'conjunction';
    if (lower === 'i' || lower === 'interj' || lower === 'interjection' || lower.includes('thán từ')) return 'interjection';
    if (lower === 'pron' || lower === 'pronoun' || lower.includes('đại từ')) return 'pronoun';
    if (lower === 'm' || lower.includes('số từ')) return 'numeral';

    return lower;
}

export function buildMeaningGroups(
    meanings: DictionaryMeaning[],
    synonyms: string[] = [],
    antonyms: string[] = []
): GroupedMeaning[] {
    const groupMap = new Map<string, { partOfSpeech: string; pos: string; definitions: GroupedDefinition[] }>();

    for (const m of meanings) {
        const rawPos = m.pos || 'Other';
        const posKey = normalizePartOfSpeech(rawPos);
        if (!groupMap.has(posKey)) {
            groupMap.set(posKey, {
                partOfSpeech: posKey,
                pos: rawPos,
                definitions: []
            });
        }
        groupMap.get(posKey)!.definitions.push({
            definition: m.definition,
            definitionVi: m.definition_lang === 'vi' ? m.definition : (m.definition_lang === 'en' ? undefined : m.definition),
            example: m.example || null
        });
    }

    const groups: GroupedMeaning[] = [];
    for (const [, grp] of groupMap.entries()) {
        groups.push({
            partOfSpeech: grp.partOfSpeech,
            part_of_speech: grp.partOfSpeech,
            pos: grp.pos,
            definitions: grp.definitions,
            synonyms: synonyms,
            antonyms: antonyms
        });
    }

    return groups;
}

/**
 * Đảm bảo mọi kết quả tiếng Anh luôn có ĐÚNG 2 phát âm (US và UK) với audio và IPA bọc chuẩn / /
 */
export function normalizeResultPronunciations(lookupRes: MultiLookupResult): MultiLookupResult {
    if (!lookupRes.exists || !lookupRes.results) return lookupRes;

    const hasEn = lookupRes.results.some(r => r.lang_code === 'en');
    const isNumberOrLatin = /^[a-zA-Z0-9\-']+$/.test(lookupRes.word.trim());

    let enPronAssigned = false;

    const normalizedResults = lookupRes.results.map((res, index) => {
        let relations = [...(res.relations || [])];
        if (res.lang_code === 'en') {
            const extraThesaurus = getSynonymsAndAntonyms(lookupRes.word);
            for (const item of extraThesaurus) {
                if (!relations.some(r => r.related_word.toLowerCase() === item.related_word.toLowerCase() && r.relation_type === item.relation_type)) {
                    relations.push(item);
                }
            }
        }

        const synonyms = Array.from(new Set(
            relations.filter(r => r.relation_type === 'Đồng nghĩa').map(r => r.related_word)
        ));
        const antonyms = Array.from(new Set(
            relations.filter(r => r.relation_type === 'Trái nghĩa').map(r => r.related_word)
        ));

        let updatedPronunciations = res.pronunciations;
        let updatedAudio = res.audio;

        if (res.lang_code === 'en') {
            enPronAssigned = true;
            updatedAudio = `/api/v1/tts?word=${encodeURIComponent(lookupRes.word)}&lang=en`;
            updatedPronunciations = formatUsUkPronunciations(lookupRes.word, res.pronunciations);
        } else if (hasEn && index !== 0) {
            // Khi đã có tiếng Anh: không trả phiên âm cho các ngôn ngữ phụ (Pháp, Đức, VN...) ở các vị trí sau
            // để đảm bảo mỗi từ tiếng Anh CHỈ trả ĐÚNG 2 phiên âm US và UK
            updatedPronunciations = [];
        } else if (isNumberOrLatin && !enPronAssigned && index === 0) {
            // Từ chữ cái Latinh hoặc chữ số: luôn trả ĐÚNG 2 phiên âm US và UK
            enPronAssigned = true;
            updatedAudio = `/api/v1/tts?word=${encodeURIComponent(lookupRes.word)}&lang=en`;
            updatedPronunciations = formatUsUkPronunciations(lookupRes.word, res.pronunciations);
        } else if (isNumberOrLatin) {
            updatedPronunciations = [];
        } else {
            updatedPronunciations = res.pronunciations.map(p => {
                const cleaned = cleanIpa(p.ipa, lookupRes.word);
                return {
                    ...p,
                    ipa: cleaned,
                    phonetic: cleaned
                };
            });
        }

        const rootRel = relations.find(r => r.relation_type === 'Gốc từ');
        const rootWord = rootRel ? rootRel.related_word : null;
        const meaningGroups = buildMeaningGroups(res.meanings, synonyms, antonyms);

        return {
            ...res,
            word: lookupRes.word,
            rootWord,
            root_word: rootWord,
            audio: updatedAudio,
            pronunciations: updatedPronunciations,
            phonetics: updatedPronunciations,
            meaning_groups: meaningGroups,
            meaningGroups: meaningGroups,
            relations,
            synonyms,
            antonyms
        };
    });

    const primary = normalizedResults[0];
    return {
        ...lookupRes,
        rootWord: primary?.rootWord ?? null,
        root_word: primary?.root_word ?? null,
        phonetics: primary?.phonetics ?? [],
        synonyms: primary?.synonyms ?? [],
        antonyms: primary?.antonyms ?? [],
        meaning_groups: primary?.meaning_groups ?? [],
        meaningGroups: primary?.meaningGroups ?? [],
        results: normalizedResults
    };
}

function isMetaGrammarDefinition(def: string): boolean {
    const trimmed = def.trim().toLowerCase();
    return /^(số nhiều|dạng quá khứ|động từ quá khứ|quá khứ|thì quá khứ|phân từ|dạng phân từ|động từ chia|dạng ngôi thứ|so sánh hơn|so sánh nhất|danh động từ|dạng thay thế)/i.test(trimmed) ||
           /^(dạng\s+|động từ\s+)?(quá khứ|phân từ|ngôi thứ ba|số nhiều|chia thì|thay thế).+của\s+[a-z]+/i.test(trimmed);
}

function extractCleanVietnameseTerm(rawDef: string): string | null {
    if (!rawDef) return null;
    if (isMetaGrammarDefinition(rawDef)) return null;

    let clean = rawDef
        .replace(/\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\{\{[^}]*\}\}/g, '')
        .replace(/^(?:như|xem|thuộc|chỉ)\s+/i, '')
        .trim();

    if (!clean) return null;
    const firstTerm = clean.split(/[,;\n\.]/)[0]?.trim();
    if (firstTerm && firstTerm.length >= 2 && firstTerm.length <= 40 && !firstTerm.includes('{') && !firstTerm.includes('<')) {
        return firstTerm;
    }
    return null;
}

function extractCleanEnglishTerm(rawDef: string): string | null {
    if (!rawDef) return null;
    let clean = rawDef
        .replace(/\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\{\{[^}]*\}\}/g, '')
        .trim();

    if (!clean) return null;
    const firstTerm = clean.split(/[,;\n\.]/)[0]?.trim();
    if (firstTerm && firstTerm.length >= 2 && firstTerm.length <= 40 && !firstTerm.includes('{') && !firstTerm.includes('<')) {
        return firstTerm;
    }
    return null;
}

function getWordData(wordId: number, wordText: string, langCode: string): LanguageResult {
    const { getMeaningsStmt, getPronunciationsStmt, getTranslationsStmt, getRelationsStmt } = getStatements();

    const meanings = getMeaningsStmt!.all(wordId) as {
        definition_id: number;
        definition: string;
        definition_lang: string;
        example: string | null;
        pos: string;
        sub_pos: string | null;
        links: string | null;
        source: string | null;
    }[];

    // Lọc bỏ các định nghĩa rác, rỗng, placeholder hoặc chỉ có dấu chấm đơn '.'
    const validMeanings = meanings
        .map(m => ({
            ...m,
            definition: sanitizeDefinition(m.definition)
        }))
        .filter(m => m.definition.length > 0);

    const updatedMeanings: DictionaryMeaning[] = validMeanings.map((meaning) => {
        let links: string[] = [];
        if (meaning.links) {
            try {
                links = JSON.parse(meaning.links);
            } catch (e) {
                console.error('Error parsing links JSON:', e);
            }
        }
        if (langCode === 'en' && links.length > 0) {
            links = links.map(l => demangleEnglishWord(l));
        }

        return {
            definition: meaning.definition,
            definition_lang: meaning.definition_lang,
            example: meaning.example,
            pos: POS_LABELS[meaning.pos] ?? meaning.pos,
            sub_pos: meaning.sub_pos ? (SUB_POS_LABELS[meaning.sub_pos] ?? meaning.sub_pos) : null,
            source: meaning.source,
            links
        };
    });

    let pronunciations = getPronunciationsStmt!.all(wordId) as DictionaryPronunciation[];
    if (langCode === 'en') {
        pronunciations = formatUsUkPronunciations(wordText, pronunciations);
    }
    let translations = getTranslationsStmt!.all(wordId) as DictionaryTranslation[];
    if (translations.length === 0 && langCode === 'en' && updatedMeanings.length > 0) {
        // Tìm định nghĩa tiếng Việt sạch đầu tiên
        for (const m of updatedMeanings) {
            if (m.definition_lang === 'vi') {
                const term = extractCleanVietnameseTerm(m.definition);
                if (term) {
                    translations = [{
                        lang_code: 'vi',
                        lang_name: 'Tiếng Việt',
                        translation: term
                    }];
                    break;
                }
            }
        }
    } else if (translations.length === 0 && langCode === 'vi' && updatedMeanings.length > 0) {
        // Tìm định nghĩa tiếng Anh cho từ tiếng Việt
        for (const m of updatedMeanings) {
            if (m.definition_lang === 'en') {
                const term = extractCleanEnglishTerm(m.definition);
                if (term) {
                    translations = [{
                        lang_code: 'en',
                        lang_name: 'Tiếng Anh',
                        translation: term
                    }];
                    break;
                }
            }
        }
    }
    const relations = getRelationsStmt!.all(wordId) as DictionaryRelation[];

    const updatedTranslations = translations.map((t) => ({
        ...t,
        lang_name: LANG_LABELS[t.lang_code] ?? t.lang_code
    }));

    const updatedRelations = relations.map((rel) => ({
        ...rel,
        related_word: (langCode === 'en') ? demangleEnglishWord(rel.related_word) : rel.related_word,
        relation_type: RELATION_LABELS[rel.relation_type] ?? rel.relation_type
    }));

    if (langCode === 'en') {
        const extraThesaurus = getSynonymsAndAntonyms(wordText);
        for (const item of extraThesaurus) {
            if (!updatedRelations.some(r => r.related_word.toLowerCase() === item.related_word.toLowerCase() && r.relation_type === item.relation_type)) {
                updatedRelations.push(item);
            }
        }
    }

    const synonyms = Array.from(new Set(
        updatedRelations.filter(r => r.relation_type === 'Đồng nghĩa').map(r => r.related_word)
    ));
    const antonyms = Array.from(new Set(
        updatedRelations.filter(r => r.relation_type === 'Trái nghĩa').map(r => r.related_word)
    ));

    const audioUrl = (langCode === 'en')
        ? `/api/v1/tts?word=${encodeURIComponent(wordText)}&lang=en&accent=us`
        : `/api/v1/tts?word=${encodeURIComponent(wordText)}&lang=${langCode}`;

    return {
        lang_code: langCode,
        lang_name: LANG_LABELS[langCode] ?? langCode,
        audio: audioUrl,
        meanings: updatedMeanings,
        pronunciations,
        translations: updatedTranslations,
        relations: updatedRelations,
        synonyms,
        antonyms
    };
}

/**
 * Direct lookup from SQLite database
 */
function lookupDirectFromDb(word: string, lang?: string): MultiLookupResult {
    const { lookupAllLangsStmt, lookupByLangStmt } = getStatements();

    const normalized = normalizeVietnamese(word.normalize('NFC').toLowerCase());

    let wordRows: { id: number; word: string; lang_code: string }[] = [];

    if (lang) {
        // Lookup specific language
        const row = lookupByLangStmt!.get(normalized, lang) as { id: number; word: string; lang_code: string } | undefined;
        if (!row && word !== normalized) {
            const fallback = lookupByLangStmt!.get(word, lang) as { id: number; word: string; lang_code: string } | undefined;
            wordRows = fallback ? [fallback] : [];
        } else if (row) {
            wordRows = [row];
        }
    } else {
        // Lookup all languages
        wordRows = lookupAllLangsStmt!.all(normalized) as { id: number; word: string; lang_code: string }[];
        if (wordRows.length === 0 && word !== normalized) {
            wordRows = lookupAllLangsStmt!.all(word) as { id: number; word: string; lang_code: string }[];
        }
    }

    // Nếu chưa tìm thấy và từ có thể là tiếng Anh có dạng bị lưu sai trong database gốc
    // (Ví dụ: quick -> quyck, liquid -> liquyd, usually -> usualli, family -> famili, city -> citi)
    if (wordRows.length === 0 && (!lang || lang === 'en')) {
        const dbVariant = toDbEnglishVariant(normalized);
        if (dbVariant !== normalized) {
            if (lang) {
                const row = lookupByLangStmt!.get(dbVariant, lang) as { id: number; word: string; lang_code: string } | undefined;
                if (row) wordRows = [row];
            } else {
                wordRows = lookupAllLangsStmt!.all(dbVariant) as { id: number; word: string; lang_code: string }[];
            }
        }
    }

    if (wordRows.length === 0) {
        return { exists: false, word: word, results: [] };
    }

    const isDbVariant = isEnglishDbVariant(wordRows[0].word, word);
    let resolvedWord = (word.toLowerCase() === wordRows[0].word.toLowerCase() || isDbVariant)
        ? word
        : wordRows[0].word;
    if (wordRows[0].lang_code === 'en') {
        resolvedWord = demangleEnglishWord(resolvedWord);
    }

    const rawResults: LanguageResult[] = wordRows.map(row => {
        let itemWord = (word.toLowerCase() === row.word.toLowerCase() || isDbVariant) ? word : row.word;
        if (row.lang_code === 'en') {
            itemWord = demangleEnglishWord(itemWord);
        }
        return getWordData(row.id, itemWord, row.lang_code);
    });

    // Chỉ giữ lại những ngôn ngữ có ít nhất 1 định nghĩa hoặc bản dịch hợp lệ
    const results = rawResults.filter(r => r.meanings.length > 0 || r.translations.length > 0);

    if (results.length === 0) {
        return { exists: false, word: word, results: [] };
    }

    return {
        exists: true,
        word: resolvedWord,
        results
    };
}

/**
 * Tự động làm giàu các từ tiếng Anh bị thiếu nghĩa hoặc chỉ có định nghĩa meta bằng cách lấy nghĩa từ từ gốc (lemma)
 */
function enrichEnglishResultWithLemmas(cleanWord: string, currentResult: LanguageResult): LanguageResult {
    const lowerWord = cleanWord.toLowerCase();
    const lemmas = getLemmas(lowerWord);

    // 1. Bổ sung nhận diện tiền tố tiếng Anh (un-, dis-, im-, in-, non-, mis-, re-, over-, under-)
    const prefixRules: RegExp[] = [
        /^un([a-z]{3,})$/,
        /^dis([a-z]{3,})$/,
        /^(?:im|in|il|ir)([a-z]{3,})$/,
        /^non\-?([a-z]{3,})$/,
        /^mis([a-z]{3,})$/,
        /^re([a-z]{3,})$/,
        /^over([a-z]{3,})$/,
        /^under([a-z]{3,})$/
    ];
    for (const regex of prefixRules) {
        const m = lowerWord.match(regex);
        if (m) {
            const root = m[1];
            if (root.length >= 3 && root !== lowerWord) {
                const rootRes = lookupDirectFromDb(root, 'en');
                if (rootRes.exists && rootRes.results.some(r => r.lang_code === 'en')) {
                    if (!lemmas.some(l => l.lemma.toLowerCase() === root)) {
                        lemmas.push({
                            lemma: root,
                            posType: 'adjective',
                            explanation: `Từ phái sinh có tiền tố từ gốc "${root}".`
                        });
                    }
                }
            }
        }
    }

    // 2. Bổ sung nhận diện hậu tố tiếng Anh (-ness, -ful, -less, -able, -ible, -ment, -tion, -sion, -er, -or, -ly)
    const suffixCandidates: string[] = [];
    if (lowerWord.endsWith('ness') && lowerWord.length > 5) {
        const base = lowerWord.slice(0, -4);
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
        suffixCandidates.push(base);
    }
    if (lowerWord.endsWith('ful') && lowerWord.length > 4) {
        const base = lowerWord.slice(0, -3);
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
        suffixCandidates.push(base);
    }
    if (lowerWord.endsWith('less') && lowerWord.length > 5) {
        const base = lowerWord.slice(0, -4);
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
        suffixCandidates.push(base);
    }
    if (lowerWord.endsWith('able') && lowerWord.length > 5) {
        const base = lowerWord.slice(0, -4);
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
        suffixCandidates.push(base, base + 'e');
    } else if (lowerWord.endsWith('ible') && lowerWord.length > 5) {
        const base = lowerWord.slice(0, -4);
        suffixCandidates.push(base, base + 'e');
    }
    if (lowerWord.endsWith('ment') && lowerWord.length > 5) {
        const base = lowerWord.slice(0, -4);
        suffixCandidates.push(base);
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
    }
    if (lowerWord.endsWith('sion') && lowerWord.length > 5) {
        suffixCandidates.push(lowerWord.slice(0, -4) + 'de', lowerWord.slice(0, -4) + 't');
    }
    if (lowerWord.endsWith('ation') && lowerWord.length > 6) {
        suffixCandidates.push(lowerWord.slice(0, -3) + 'e', lowerWord.slice(0, -5), lowerWord.slice(0, -5) + 'e');
    }
    if (lowerWord.endsWith('ion') && lowerWord.length > 4) {
        suffixCandidates.push(lowerWord.slice(0, -3), lowerWord.slice(0, -3) + 'e');
    }
    if (lowerWord.endsWith('er') && lowerWord.length > 4) {
        const base = lowerWord.slice(0, -2);
        if (base.length >= 3 && base[base.length - 1] === base[base.length - 2] && !/[aeiouy]/.test(base[base.length - 1])) {
            suffixCandidates.push(base.slice(0, -1));
        }
        suffixCandidates.push(base, base + 'e');
        if (base.endsWith('i')) suffixCandidates.push(base.slice(0, -1) + 'y');
    } else if (lowerWord.endsWith('or') && lowerWord.length > 4) {
        const base = lowerWord.slice(0, -2);
        if (base.length >= 3 && base[base.length - 1] === base[base.length - 2] && !/[aeiouy]/.test(base[base.length - 1])) {
            suffixCandidates.push(base.slice(0, -1));
        }
        suffixCandidates.push(base, base + 'e', base + 't');
    }
    if (lowerWord.endsWith('ily') && lowerWord.length > 4) {
        suffixCandidates.push(lowerWord.slice(0, -3) + 'y');
    } else if (lowerWord.endsWith('ly') && lowerWord.length > 3) {
        suffixCandidates.push(lowerWord.slice(0, -2));
    }

    for (const cand of suffixCandidates) {
        if (cand.length >= 3 && cand !== lowerWord && !lemmas.some(l => l.lemma.toLowerCase() === cand)) {
            const rootRes = lookupDirectFromDb(cand, 'en');
            if (rootRes.exists && rootRes.results.some(r => r.lang_code === 'en')) {
                lemmas.push({
                    lemma: cand,
                    posType: 'noun',
                    explanation: `Từ phái sinh có hậu tố từ gốc "${cand}".`
                });
                break;
            }
        }
    }

    if (!lemmas || lemmas.length === 0) {
        return currentResult;
    }

    let relations = [...currentResult.relations];
    let pronunciations = currentResult.pronunciations;
    let meanings = [...currentResult.meanings];
    let translations = [...currentResult.translations];
    let hasEnrichedMeanings = false;

    // 1. Luôn bổ sung quan hệ Gốc từ cho tất cả các lemma hợp lệ
    for (const item of lemmas) {
        if (item.lemma.toLowerCase() === lowerWord) continue;
        if (!relations.some(rel => rel.related_word.toLowerCase() === item.lemma.toLowerCase() && rel.relation_type === 'Gốc từ')) {
            relations.unshift({
                related_word: item.lemma,
                relation_type: 'Gốc từ'
            });
        }
    }

    const hasMetaDef = currentResult.meanings.some(m => isMetaGrammarDefinition(m.definition));
    const isPoorDefs = currentResult.meanings.length <= 1;

    for (const item of lemmas) {
        if (item.lemma.toLowerCase() === lowerWord) continue;

        const baseResult = lookupDirectFromDb(item.lemma, 'en');
        if (!baseResult.exists || baseResult.results.length === 0) continue;

        const baseEnglish = baseResult.results.find(res => res.lang_code === 'en');
        if (!baseEnglish) continue;

        // Kế thừa quan hệ (đồng nghĩa, trái nghĩa, liên quan) từ từ gốc nếu từ hiện tại chưa có
        for (const rel of baseEnglish.relations) {
            if (rel.relation_type === 'Gốc từ') continue;
            if (rel.related_word.toLowerCase() === lowerWord) continue;
            if (!relations.some(r => r.related_word.toLowerCase() === rel.related_word.toLowerCase() && r.relation_type === rel.relation_type)) {
                relations.push(rel);
            }
        }

        // Kế thừa bản dịch từ từ gốc nếu từ hiện tại chưa có hoặc bản dịch hiện tại là mô tả ngữ pháp
        if ((translations.length === 0 || translations.some(t => isMetaGrammarDefinition(t.translation))) && baseEnglish.translations.length > 0) {
            translations = [...baseEnglish.translations];
        }

        // Nếu từ hiện tại có định nghĩa meta hoặc có quá ít nghĩa so với từ gốc
        if ((hasMetaDef || isPoorDefs) && !hasEnrichedMeanings && baseEnglish.meanings.length > 0) {
            hasEnrichedMeanings = true;
            const seenDefs = new Set<string>();
            meanings.forEach(m => seenDefs.add(m.definition.trim().toLowerCase()));

            const addedBaseMeanings: DictionaryMeaning[] = [];
            for (const bm of baseEnglish.meanings) {
                const norm = bm.definition.trim().toLowerCase();
                const isDuplicate = Array.from(seenDefs).some(existing => 
                    existing === norm || 
                    (existing.length > 5 && norm.length > 5 && (existing.includes(norm) || norm.includes(existing)))
                );
                if (!isDuplicate) {
                    seenDefs.add(norm);
                    addedBaseMeanings.push(bm);
                }
            }

            meanings = [...meanings, ...addedBaseMeanings];

            // Kế thừa phiên âm nếu từ hiện tại chưa có
            if (pronunciations.length === 0) {
                pronunciations = baseEnglish.pronunciations;
            }
        }
    }

    return {
        ...currentResult,
        meanings,
        pronunciations,
        translations,
        relations
    };
}

/**
 * Tra cứu đồng bộ nội bộ (SQLite DB, Custom Words, Địa danh, Tên riêng, Số, Thời gian, Lemmatizer)
 */
export function lookupWordSync(word: string, lang?: string): MultiLookupResult {
    const cleanWord = word.trim().replace(/[’‘`]/g, "'").replace(/-{2,}/g, '-');

    // 1. Kiểm tra trong Custom Words trước
    const customEntry = getCustomWord(cleanWord);
    if (customEntry) {
        // Nếu có kết quả tùy chỉnh riêng (như từ he's, she's)
        if (customEntry.results && customEntry.results.length > 0) {
            const filteredResults = lang
                ? customEntry.results.filter(r => r.lang_code === lang)
                : customEntry.results;
            if (filteredResults.length > 0) {
                return normalizeResultPronunciations({
                    exists: true,
                    word: customEntry.word,
                    results: filteredResults
                });
            }
        }

        // Nếu là dạng aliasTo (chuyển hướng lấy nghĩa từ từ gốc, ví dụ classes -> class, a.m. -> am)
        const targetAlias = customEntry.aliasTo;
        if (targetAlias) {
            const baseResult = lookupWordSync(targetAlias, lang);
            if (baseResult.exists) {
                // Nếu từ tra cứu có dạng tiếng Anh / Latinh, ưu tiên kết quả tiếng Anh lên đầu
                let sortedResults = [...baseResult.results];
                if (!lang && /^[a-zA-Z\-']+$/.test(cleanWord)) {
                    const enIdx = sortedResults.findIndex(r => r.lang_code === 'en');
                    if (enIdx > 0) {
                        const enRes = sortedResults.splice(enIdx, 1)[0];
                        sortedResults.unshift(enRes);
                    }
                }
                const results = sortedResults.map((r, idx) => {
                    const relations = [...r.relations];
                    if (!relations.some(rel => rel.related_word.toLowerCase() === targetAlias.toLowerCase() && rel.relation_type === 'Gốc từ')) {
                        relations.unshift({
                            related_word: targetAlias,
                            relation_type: 'Gốc từ'
                        });
                    }
                    let meanings = [...r.meanings];
                    if (customEntry.note && (r.lang_code === 'en' || idx === 0)) {
                        const noteMeaning: DictionaryMeaning = {
                            definition: customEntry.note,
                            definition_lang: 'vi',
                            example: null,
                            pos: r.meanings[0]?.pos || 'Ngữ pháp',
                            sub_pos: 'Ghi chú ngữ pháp',
                            source: 'Custom',
                            links: [targetAlias]
                        };
                        meanings = [noteMeaning, ...meanings];
                    }
                    let pronunciations = r.pronunciations;
                    if (customEntry.pronunciations && customEntry.pronunciations.length > 0) {
                        pronunciations = customEntry.pronunciations;
                    }
                    return {
                        ...r,
                        meanings,
                        pronunciations,
                        relations
                    };
                });
                return normalizeResultPronunciations({
                    ...baseResult,
                    results
                });
            }
        }
    }

    // 1.1. Tra cứu Địa danh & Tên riêng trong danh mục Offline tốc độ cao (Places & Names DB)
    const placeOrNameResults = getPlaceOrName(cleanWord);
    if (placeOrNameResults && placeOrNameResults.length > 0) {
        const filtered = lang ? placeOrNameResults.filter(r => r.lang_code === lang) : placeOrNameResults;
        if (filtered.length > 0) {
            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results: filtered
            });
        }
    }

    // 1.2. Ánh xạ địa danh không dấu của Việt Nam sang có dấu (ha noi -> hà nội, da nang -> đà nẵng...)
    const lowerClean = cleanWord.toLowerCase();
    if (VN_UNACCENTED_PLACES[lowerClean]) {
        const accentedTarget = VN_UNACCENTED_PLACES[lowerClean];
        const accentedDbResult = lookupDirectFromDb(accentedTarget, lang);
        if (accentedDbResult.exists) {
            return normalizeResultPronunciations({
                exists: true,
                word: accentedDbResult.word,
                results: accentedDbResult.results.map(r => ({
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`
                }))
            });
        }
        const placeRes = getPlaceOrName(accentedTarget);
        if (placeRes && placeRes.length > 0) {
            const filtered = lang ? placeRes.filter(r => r.lang_code === lang) : placeRes;
            if (filtered.length > 0) {
                return normalizeResultPronunciations({
                    exists: true,
                    word: accentedTarget,
                    results: filtered
                });
            }
        }
    }

    // 2. Tra cứu trực tiếp từ SQLite Database
    const dbResult = lookupDirectFromDb(cleanWord, lang);
    if (dbResult.exists) {
        let enrichedResults = dbResult.results.map(r => {
            if (r.lang_code === 'en' || !lang) {
                return enrichEnglishResultWithLemmas(cleanWord, r);
            }
            return r;
        });

        // Tối ưu thứ tự ngôn ngữ thông minh khi không truyền tham số lang:
        // Đối với từ đơn chữ cái Latinh không dấu (ví dụ: go, run, can, do, in, to, account, hotel, game, code, tennis, film...):
        // Nếu có kết quả tiếng Anh hợp lệ, tự động đưa tiếng Anh lên results[0] để đảm bảo đầy đủ phiên âm US/UK, quan hệ và bản dịch
        // (Ngoại trừ một số ít từ đơn thuần Việt như: ai, cha, em, qua, ra, xe)
        if (!lang && enrichedResults.length > 1) {
            const isPureLatinSingleWord = cleanWord.trim().length >= 2 && /^[a-zA-Z\-']+$/.test(cleanWord.trim()) && !cleanWord.trim().includes(' ');
            const PURE_VIETNAMESE_MONOSYLLABLES = new Set(['ai', 'cha', 'em', 'qua', 'ra', 'xe']);
            const isPureVi = PURE_VIETNAMESE_MONOSYLLABLES.has(cleanWord.toLowerCase());

            if (isPureLatinSingleWord && !isPureVi) {
                const enIdx = enrichedResults.findIndex(r => r.lang_code === 'en' && (r.meanings.length > 0 || r.translations.length > 0));
                if (enIdx > 0) {
                    const enRes = enrichedResults.splice(enIdx, 1)[0];
                    enrichedResults.unshift(enRes);
                }
            }
        }

        // Xử lý hiện tượng ngôn ngữ lạ che lấp tiếng Anh (ví dụ: made ra Dungan, came/best ra Pháp/Na Uy...)
        const isLatin = /^[a-zA-Z\-']+$/.test(cleanWord);
        const hasEn = enrichedResults.some(r => r.lang_code === 'en' && r.meanings.length > 0);
        if (isLatin && !hasEn && !lang) {
            const candidates = [
                ...getLemmas(cleanWord).map(l => l.lemma),
                ...getSpellingVariants(cleanWord)
            ];
            for (const cand of candidates) {
                if (cand.toLowerCase() === cleanWord.toLowerCase()) continue;
                const baseResult = lookupDirectFromDb(cand, 'en');
                if (baseResult.exists && baseResult.results.length > 0) {
                    const baseEn = baseResult.results.find(r => r.lang_code === 'en');
                    if (baseEn && baseEn.meanings.length > 0) {
                        const lemmaEnResult: LanguageResult = {
                            ...baseEn,
                            audio: `/api/v1/tts?word=${encodeURIComponent(cand)}&lang=en`,
                            meanings: [...baseEn.meanings],
                            relations: [
                                { related_word: cand, relation_type: 'Gốc từ' },
                                ...baseEn.relations
                            ]
                        };
                        enrichedResults = [lemmaEnResult, ...enrichedResults];
                        break;
                    }
                }
            }
        }

        return normalizeResultPronunciations({
            ...dbResult,
            results: enrichedResults
        });
    }

    // 2.1. Tra cứu Số (Numbers Engine: 0, 1, 100, 2024, 3.14, 1st, 2nd, IV, X...)
    const numberResults = parseNumberEntry(cleanWord);
    if (numberResults && numberResults.length > 0) {
        const filtered = lang ? numberResults.filter(r => r.lang_code === lang) : numberResults;
        if (filtered.length > 0) {
            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results: filtered
            });
        }
    }

    // 2.2. Tra cứu Thời gian (Time Engine: 10:30, 10h30, 10:30am, 12:00, 7pm...)
    const timeResults = parseTimeEntry(cleanWord);
    if (timeResults && timeResults.length > 0) {
        const filtered = lang ? timeResults.filter(r => r.lang_code === lang) : timeResults;
        if (filtered.length > 0) {
            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results: filtered
            });
        }
    }

    // 3. Tra cứu bảng toàn bộ từ viết tắt tiếng Anh (Contractions Engine: he's, won't, don't, they're...)
    const contraction = getContraction(cleanWord);
    if (contraction) {
        const baseResult = lookupDirectFromDb(contraction.baseWord, lang || 'en');
        if (baseResult.exists) {
            const results = baseResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `${contraction.description} (Dạng đầy đủ: ${contraction.expansion}).`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Từ viết tắt',
                    sub_pos: 'Rút gọn / Trợ động từ',
                    source: 'Contractions Engine',
                    links: [contraction.baseWord]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: contraction.baseWord, relation_type: 'Gốc từ' },
                        ...r.relations
                    ]
                };
            });
            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results
            });
        }
    }

    // 3.1. Tra cứu dạng sở hữu cách tiếng Anh (Possessive: dog's -> dog, teachers' -> teacher, Quan's -> Quan)
    const possessive = getPossessive(cleanWord);
    if (possessive) {
        let baseResult = lookupDirectFromDb(possessive.base, lang || 'en');
        if (!baseResult.exists) {
            const placeRes = getPlaceOrName(possessive.base) || getPlaceOrName(possessive.displayBase);
            if (placeRes && placeRes.length > 0) {
                baseResult = {
                    exists: true,
                    word: possessive.displayBase,
                    results: placeRes
                };
            }
        }
        if (!baseResult.exists) {
            const baseLemmas = getLemmas(possessive.base);
            for (const item of baseLemmas) {
                const lemmaResult = lookupDirectFromDb(item.lemma, lang || 'en');
                if (lemmaResult.exists) {
                    baseResult = lemmaResult;
                    break;
                }
            }
        }
        if (!baseResult.exists && possessive.base.endsWith('s') && possessive.base.length > 2) {
            const singular = possessive.base.slice(0, -1);
            const singularResult = lookupDirectFromDb(singular, lang || 'en');
            if (singularResult.exists) {
                baseResult = singularResult;
            }
        }

        // Tìm kiếm base trong DB ở mọi ngôn ngữ khác (ví dụ: 'quan' có trong tiếng Việt)
        let anyLangDbResult: MultiLookupResult | null = null;
        if (!baseResult.exists) {
            const dbAny = lookupDirectFromDb(possessive.base);
            if (dbAny.exists) {
                anyLangDbResult = dbAny;
            }
        }

        if (baseResult.exists) {
            const results = baseResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `${possessive.explanation}`,
                    definition_lang: 'vi',
                    example: possessive.example,
                    pos: 'Dạng sở hữu cách',
                    sub_pos: 'Sở hữu cách (Possessive case)',
                    source: 'Possessive Engine',
                    links: [possessive.displayBase]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: possessive.displayBase, relation_type: 'Gốc từ' },
                        ...r.relations
                    ]
                };
            });
            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results
            });
        } else {
            // Khi từ gốc là tên riêng hoặc từ chưa có trong DB tiếng Anh (Quan's, Quân's, Alex's, Sarah's...)
            const noteMeaning: DictionaryMeaning = {
                definition: possessive.explanation,
                definition_lang: 'vi',
                example: possessive.example,
                pos: 'Dạng sở hữu cách',
                sub_pos: 'Sở hữu cách (Possessive case)',
                source: 'Possessive Engine',
                links: [possessive.displayBase]
            };

            const enResult: LanguageResult = {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=en`,
                meanings: [noteMeaning],
                pronunciations: formatUsUkPronunciations(cleanWord),
                translations: [],
                relations: [
                    { related_word: possessive.displayBase, relation_type: 'Gốc từ' }
                ]
            };

            const combined: LanguageResult[] = [enResult];
            if (anyLangDbResult && anyLangDbResult.results.length > 0) {
                for (const r of anyLangDbResult.results) {
                    if (r.lang_code !== 'en') {
                        combined.push(r);
                    }
                }
            }

            return normalizeResultPronunciations({
                exists: true,
                word: cleanWord,
                results: combined
            });
        }
    }

    // 3.2. Tra cứu biến thể chính tả Anh - Mỹ và từ ghép gạch nối (color <-> colour, well-known <-> well known)
    const spellingVariants = getSpellingVariants(cleanWord);
    for (const variant of spellingVariants) {
        if (variant.toLowerCase() === cleanWord.toLowerCase()) continue;
        const variantResult = lookupDirectFromDb(variant, lang || 'en');
        if (variantResult.exists && variantResult.results.length > 0) {
            return normalizeResultPronunciations(variantResult);
        }
    }

    // 4. Tra cứu tự động hình thái từ (Lemmatizer NLP Engine: bất quy tắc, số nhiều, chia thì, so sánh)
    // Trả về trực tiếp dữ liệu từ gốc (class, box, go, mouse, happy...) sạch sẽ, chuẩn xác
    const lemmas = getLemmas(cleanWord);
    for (const item of lemmas) {
        if (item.lemma.toLowerCase() === cleanWord.toLowerCase()) continue;
        const lemmaResult = lookupDirectFromDb(item.lemma, lang || 'en');
        if (lemmaResult.exists && lemmaResult.results.length > 0) {
            const results = lemmaResult.results.map(r => {
                const relations = [...r.relations];
                if (!relations.some(rel => rel.related_word.toLowerCase() === item.lemma.toLowerCase() && rel.relation_type === 'Gốc từ')) {
                    relations.unshift({
                        related_word: item.lemma,
                        relation_type: 'Gốc từ'
                    });
                }
                return {
                    ...r,
                    relations
                };
            });
            return normalizeResultPronunciations({
                ...lemmaResult,
                results
            });
        }
    }

    // 5. Fallback dự phòng quy tắc đuôi từ (Suffix Rule-based Fallback)
    const lowerWord = cleanWord.toLowerCase();
    const candidateLemmas: string[] = [];
    if (lowerWord.endsWith('ies') && lowerWord.length > 4) {
        candidateLemmas.push(lowerWord.slice(0, -3) + 'y'); // flies -> fly, studies -> study
    }
    if (lowerWord.endsWith('es') && lowerWord.length > 3) {
        candidateLemmas.push(lowerWord.slice(0, -2)); // classes -> class, boxes -> box
        candidateLemmas.push(lowerWord.slice(0, -1)); // houses -> house
    }
    if (lowerWord.endsWith('s') && !lowerWord.endsWith('ss') && lowerWord.length > 2) {
        candidateLemmas.push(lowerWord.slice(0, -1)); // cats -> cat, books -> book
    }
    if (lowerWord.endsWith('ed') && lowerWord.length > 3) {
        candidateLemmas.push(lowerWord.slice(0, -2)); // walked -> walk
        candidateLemmas.push(lowerWord.slice(0, -1)); // loved -> love
    }
    if (lowerWord.endsWith('ing') && lowerWord.length > 4) {
        candidateLemmas.push(lowerWord.slice(0, -3)); // walking -> walk
        candidateLemmas.push(lowerWord.slice(0, -3) + 'e'); // making -> make
    }

    for (const lemma of candidateLemmas) {
        if (lemma.toLowerCase() === cleanWord.toLowerCase()) continue;
        const lemmaResult = lookupDirectFromDb(lemma, lang || 'en');
        if (lemmaResult.exists && lemmaResult.results.length > 0) {
            const results = lemmaResult.results.map(r => {
                const relations = [...r.relations];
                if (!relations.some(rel => rel.related_word.toLowerCase() === lemma.toLowerCase() && rel.relation_type === 'Gốc từ')) {
                    relations.unshift({
                        related_word: lemma,
                        relation_type: 'Gốc từ'
                    });
                }
                return {
                    ...r,
                    relations
                };
            });
            return normalizeResultPronunciations({
                ...lemmaResult,
                results
            });
        }
    }

    // 6. Tra cứu tiền tố phủ định tiếng Anh (un-, dis-, im-, in-, non-)
    const prefixCandidates: { prefix: string; root: string }[] = [];
    if (lowerWord.startsWith('un') && lowerWord.length > 4) prefixCandidates.push({ prefix: 'un-', root: lowerWord.slice(2) });
    if (lowerWord.startsWith('dis') && lowerWord.length > 5) prefixCandidates.push({ prefix: 'dis-', root: lowerWord.slice(3) });
    if (lowerWord.startsWith('im') && lowerWord.length > 4) prefixCandidates.push({ prefix: 'im-', root: lowerWord.slice(2) });
    if (lowerWord.startsWith('in') && lowerWord.length > 4) prefixCandidates.push({ prefix: 'in-', root: lowerWord.slice(2) });
    if (lowerWord.startsWith('non-')) prefixCandidates.push({ prefix: 'non-', root: lowerWord.slice(4) });
    else if (lowerWord.startsWith('non') && lowerWord.length > 5) prefixCandidates.push({ prefix: 'non-', root: lowerWord.slice(3) });

    for (const cand of prefixCandidates) {
        if (cand.root.toLowerCase() === cleanWord.toLowerCase()) continue;
        const rootResult = lookupDirectFromDb(cand.root, lang || 'en');
        if (rootResult.exists && rootResult.results.length > 0) {
            const results = rootResult.results.map(r => {
                const relations = [...r.relations];
                if (!relations.some(rel => rel.related_word.toLowerCase() === cand.root.toLowerCase() && rel.relation_type === 'Gốc từ')) {
                    relations.unshift({
                        related_word: cand.root,
                        relation_type: 'Gốc từ'
                    });
                }
                return {
                    ...r,
                    relations
                };
            });
            return normalizeResultPronunciations({
                ...rootResult,
                results
            });
        }
    }

    // 7. Làm sạch dấu câu dư thừa ở đầu và cuối chuỗi (Punctuation Trimming Fallback)
    // Ví dụ: "hello.", "word?", "apple,", "“vietnam”", "(example)"
    const stripped = cleanWord.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (stripped && stripped !== cleanWord && stripped.length >= 1) {
        const retryResult = lookupWordSync(stripped, lang);
        if (retryResult.exists) {
            return normalizeResultPronunciations(retryResult);
        }
    }

    return { exists: false, word: cleanWord, results: [] };
}

/**
 * Tra cứu từ điển đa ngôn ngữ (Asynchronous)
 * Tích hợp toàn bộ hệ thống Offline (SQLite, Custom, Địa danh 63 tỉnh thành, Quốc gia, Thủ đô, Sông hồ, Núi non, Nhân vật, Số, Thời gian, Lemmatizer)
 * và Tự động Fallback sang Bách khoa toàn thư Wikipedia cho toàn bộ các thực thể bách khoa trên toàn cầu.
 * @param word - Từ hoặc thực thể cần tra cứu
 * @param lang - Tùy chọn mã ngôn ngữ ('vi', 'en'...)
 * @returns MultiLookupResult
 */
export async function lookupWord(word: string, lang?: string): Promise<MultiLookupResult> {
    const syncResult = lookupWordSync(word, lang);
    if (syncResult.exists) {
        // Nếu kết quả đồng bộ chưa có tiếng Anh cho từ Latinh (ví dụ problem, single, district chỉ có no/fr trong SQLite)
        const isLatin = /^[a-zA-Z\-']+$/.test(word.trim());
        const hasEn = syncResult.results.some(r => r.lang_code === 'en' && r.meanings.length > 0);
        if (isLatin && !hasEn && (!lang || lang === 'en')) {
            try {
                const wiktionaryRes = await lookupWiktionaryFallback(word, 'en');
                if (wiktionaryRes && wiktionaryRes.exists && wiktionaryRes.results.length > 0) {
                    const enLangResult = wiktionaryRes.results.find(r => r.lang_code === 'en');
                    if (enLangResult && enLangResult.meanings.length > 0) {
                        return normalizeResultPronunciations({
                            ...syncResult,
                            results: [enLangResult, ...syncResult.results]
                        });
                    }
                }
            } catch (e) {
                console.error('Wiktionary enrichment error:', e);
            }
        }
        return normalizeResultPronunciations(syncResult);
    }

    // 1. Tra cứu Wiktionary & Từ điển Mở trước (từ điển ngôn ngữ, từ loại Noun/Verb/Adj/Adv, từ ghép, bản dịch...)
    try {
        const wiktionaryResult = await lookupWiktionaryFallback(word, lang);
        if (wiktionaryResult && wiktionaryResult.exists && wiktionaryResult.results.length > 0) {
            return normalizeResultPronunciations(wiktionaryResult);
        }
    } catch (e) {
        console.error('Wiktionary fallback error:', e);
    }

    // 2. Nếu từ điển chưa có, tra cứu Bách khoa toàn thư Wikipedia (địa danh, tên riêng, thực thể văn hóa/khoa học)
    try {
        const wikiResult = await lookupWikiFallback(word, lang);
        if (wikiResult && wikiResult.exists && wikiResult.results.length > 0) {
            return normalizeResultPronunciations(wikiResult);
        }
    } catch (e) {
        console.error('Wikipedia fallback error:', e);
    }

    return normalizeResultPronunciations(syncResult);
}

// Prepared statement for suggestions (lazy loaded)
let suggestStmt: Database.Statement | null = null;
let suggestByLangStmt: Database.Statement | null = null;

/**
 * Get word suggestions based on prefix
 * Combines suggestions from Custom Words, Contractions, Places & Names, and SQLite Database
 * @param prefix - The prefix to search for
 * @param limit - Maximum number of suggestions to return
 * @param lang - Optional language code to filter by
 * @returns Array of suggested words
 */
export function getSuggestions(prefix: string, limit: number = 8, lang?: string): string[] {
    const cleanPrefix = prefix.trim().toLowerCase().replace(/[’‘`]/g, "'");
    if (!cleanPrefix) return [];

    let customList = getCustomSuggestions(cleanPrefix, limit);
    if (lang) {
        customList = customList.filter(word => {
            const entry = getCustomWord(word);
            if (!entry) return true;
            if (entry.results && entry.results.length > 0) {
                return entry.results.some(r => r.lang_code === lang);
            }
            return lang === 'en';
        });
    }

    const contractionSuggestions = (!lang || lang === 'en')
        ? Object.keys(CONTRACTIONS)
            .filter(k => k.startsWith(cleanPrefix))
            .slice(0, limit)
        : [];

    const placesSuggestions = (!lang || lang === 'vi')
        ? getPlacesSuggestions(cleanPrefix, limit)
        : getPlacesSuggestions(cleanPrefix, limit).filter(p => !/[à-ỹÀ-Ỹ]/.test(p));

    const database = getDb();
    const normalizedPrefix = normalizeVietnamese(prefix.normalize('NFC').toLowerCase());
    const dbPrefixVariant = toDbEnglishVariant(normalizedPrefix);
    let dbRows: string[] = [];

    if (lang) {
        if (!suggestByLangStmt) {
            suggestByLangStmt = database.prepare(`
                SELECT DISTINCT word FROM words 
                WHERE (word LIKE ? || '%' OR word LIKE ? || '%') AND lang_code = ?
                ORDER BY LENGTH(word), word
                LIMIT ?
            `);
        }
        const rows = suggestByLangStmt.all(normalizedPrefix, dbPrefixVariant, lang, limit) as { word: string }[];
        dbRows = rows.map(r => (lang === 'en' ? demangleEnglishWord(r.word) : r.word));
    } else {
        if (!suggestStmt) {
            suggestStmt = database.prepare(`
                SELECT DISTINCT word FROM words 
                WHERE word LIKE ? || '%' OR word LIKE ? || '%'
                ORDER BY 
                    CASE lang_code WHEN 'vi' THEN 0 ELSE 1 END,
                    LENGTH(word), word
                LIMIT ?
            `);
        }
        const rows = suggestStmt.all(normalizedPrefix, dbPrefixVariant, limit) as { word: string }[];
        dbRows = rows.map(r => demangleEnglishWord(r.word));
    }

    // Gộp gợi ý từ Custom Words, Contractions, Places và Database, loại bỏ trùng lặp
    const merged = Array.from(new Set([...customList, ...contractionSuggestions, ...placesSuggestions, ...dbRows]));
    return merged.slice(0, limit);
}
