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
    r: 'Liên quan'
};

// Language labels - auto-generated from kaikki.org-dictionary-all.jsonl
import { LANG_LABELS } from './lang_labels';
import { getCustomWord, getCustomSuggestions } from './custom_words';
import { getContraction, getLemmas, getPossessive, getSpellingVariants, CONTRACTIONS } from './morphology';
import { parseNumberEntry, parseTimeEntry } from './number_time_engine';
import { VN_UNACCENTED_PLACES, getPlaceOrName, getPlacesSuggestions } from './places_and_names';
import { lookupWikiFallback } from './wiki_fallback';
import { lookupWiktionaryFallback } from './wiktionary_fallback';




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
    region: string | null;
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
    audio: string;
    meanings: DictionaryMeaning[];
    pronunciations: DictionaryPronunciation[];
    translations: DictionaryTranslation[];
    relations: DictionaryRelation[];
}

// Multi-language lookup result
export interface MultiLookupResult {
    exists: boolean;
    word: string;
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

function normalizeVietnamese(text: string): string {
    if (!text) return '';

    let result = text;

    result = result.replace(/(?<!u)([hklmst])y(?=\s|$|[.,!?])/g, '$1i')
        .replace(/(?<!u)([hklmst])ỳ(?=\s|$|[.,!?])/g, '$1ì')
        .replace(/(?<!u)([hklmst])ý(?=\s|$|[.,!?])/g, '$1í')
        .replace(/(?<!u)([hklmst])ỷ(?=\s|$|[.,!?])/g, '$1ỉ')
        .replace(/(?<!u)([hklmst])ỹ(?=\s|$|[.,!?])/g, '$1ĩ')
        .replace(/(?<!u)([hklmst])ỵ(?=\s|$|[.,!?])/g, '$1ị');

    if (result.includes('qui')) {
        result = result.replace(/qui/g, 'quy').replace(/quì/g, 'quỳ').replace(/quí/g, 'quý')
            .replace(/quỉ/g, 'quỷ').replace(/quĩ/g, 'quỹ').replace(/quị/g, 'quỵ');
    }

    if (/[ùúủũụòóỏõọ]/.test(result)) {
        result = result.replace(/ùy/g, 'uỳ').replace(/úy/g, 'uý').replace(/ủy/g, 'uỷ').replace(/ũy/g, 'uỹ').replace(/ụy/g, 'uỵ')
            .replace(/òa/g, 'oà').replace(/óa/g, 'oá').replace(/ỏa/g, 'oả').replace(/õa/g, 'oã').replace(/ọa/g, 'oạ')
            .replace(/òe/g, 'oè').replace(/óe/g, 'oé').replace(/ỏe/g, 'oẻ').replace(/õe/g, 'oẽ').replace(/ọe/g, 'oẹ');
    }

    return result;
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

    const updatedMeanings: DictionaryMeaning[] = meanings.map((meaning) => {
        let links: string[] = [];
        if (meaning.links) {
            try {
                links = JSON.parse(meaning.links);
            } catch (e) {
                console.error('Error parsing links JSON:', e);
            }
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

    const pronunciations = getPronunciationsStmt!.all(wordId) as DictionaryPronunciation[];
    const translations = getTranslationsStmt!.all(wordId) as DictionaryTranslation[];
    const relations = getRelationsStmt!.all(wordId) as DictionaryRelation[];

    const updatedTranslations = translations.map((t) => ({
        ...t,
        lang_name: LANG_LABELS[t.lang_code] ?? t.lang_code
    }));

    const updatedRelations = relations.map((rel) => ({
        ...rel,
        relation_type: RELATION_LABELS[rel.relation_type] ?? rel.relation_type
    }));

    return {
        lang_code: langCode,
        lang_name: LANG_LABELS[langCode] ?? langCode,
        audio: `/api/v1/tts?word=${encodeURIComponent(wordText)}&lang=${langCode}`,
        meanings: updatedMeanings,
        pronunciations,
        translations: updatedTranslations,
        relations: updatedRelations
    };
}

/**
 * Direct lookup from SQLite database
 */
function lookupDirectFromDb(word: string, lang?: string): MultiLookupResult {
    const { lookupAllLangsStmt, lookupByLangStmt } = getStatements();

    const normalized = normalizeVietnamese(word.normalize('NFC').toLowerCase());

    let wordRows: { id: number; word: string; lang_code: string }[];

    if (lang) {
        // Lookup specific language
        const row = lookupByLangStmt!.get(normalized, lang) as { id: number; word: string; lang_code: string } | undefined;
        if (!row) {
            const fallback = lookupByLangStmt!.get(word, lang) as { id: number; word: string; lang_code: string } | undefined;
            wordRows = fallback ? [fallback] : [];
        } else {
            wordRows = [row];
        }
    } else {
        // Lookup all languages
        wordRows = lookupAllLangsStmt!.all(normalized) as { id: number; word: string; lang_code: string }[];
        if (wordRows.length === 0) {
            wordRows = lookupAllLangsStmt!.all(word) as { id: number; word: string; lang_code: string }[];
        }
    }

    if (wordRows.length === 0) {
        return { exists: false, word: normalized, results: [] };
    }

    const results: LanguageResult[] = wordRows.map(row =>
        getWordData(row.id, row.word, row.lang_code)
    );

    return {
        exists: true,
        word: wordRows[0].word,
        results
    };
}

/**
 * Tra cứu đồng bộ nội bộ (SQLite DB, Custom Words, Địa danh, Tên riêng, Số, Thời gian, Lemmatizer)
 */
export function lookupWordSync(word: string, lang?: string): MultiLookupResult {
    const cleanWord = word.trim().replace(/[’‘`]/g, "'");

    // 1. Kiểm tra trong Custom Words trước
    const customEntry = getCustomWord(cleanWord);
    if (customEntry) {
        // Nếu có kết quả tùy chỉnh riêng (như từ he's, she's)
        if (customEntry.results && customEntry.results.length > 0) {
            const filteredResults = lang
                ? customEntry.results.filter(r => r.lang_code === lang)
                : customEntry.results;
            if (filteredResults.length > 0) {
                return {
                    exists: true,
                    word: customEntry.word,
                    results: filteredResults
                };
            }
        }

        // Nếu là dạng aliasTo (chuyển hướng lấy nghĩa từ từ gốc, ví dụ classes -> class)
        const targetAlias = customEntry.aliasTo;
        if (targetAlias) {
            const baseResult = lookupDirectFromDb(targetAlias, lang);
            if (baseResult.exists) {
                const results = baseResult.results.map(r => {
                    if (r.lang_code === 'en' || !lang) {
                        const noteMeaning: DictionaryMeaning = {
                            definition: customEntry.note || `Dạng biến thể của từ "${targetAlias}".`,
                            definition_lang: 'vi',
                            example: null,
                            pos: 'Dạng biến thể',
                            sub_pos: 'Biến thể ngữ pháp',
                            source: 'Custom',
                            links: [targetAlias]
                        };
                        return {
                            ...r,
                            audio: `/api/v1/tts?word=${encodeURIComponent(customEntry.word)}&lang=${r.lang_code}`,
                            meanings: [noteMeaning, ...r.meanings],
                            relations: [
                                { related_word: targetAlias, relation_type: 'Gốc từ' },
                                ...r.relations
                            ]
                        };
                    }
                    return r;
                });
                return {
                    exists: true,
                    word: customEntry.word,
                    results
                };
            }
        }
    }

    // 1.1. Tra cứu Địa danh & Tên riêng trong danh mục Offline tốc độ cao (Places & Names DB)
    const placeOrNameResults = getPlaceOrName(cleanWord);
    if (placeOrNameResults && placeOrNameResults.length > 0) {
        const filtered = lang ? placeOrNameResults.filter(r => r.lang_code === lang) : placeOrNameResults;
        if (filtered.length > 0) {
            return {
                exists: true,
                word: cleanWord,
                results: filtered
            };
        }
    }

    // 1.2. Ánh xạ địa danh không dấu của Việt Nam sang có dấu (ha noi -> hà nội, da nang -> đà nẵng...)
    const lowerClean = cleanWord.toLowerCase();
    if (VN_UNACCENTED_PLACES[lowerClean]) {
        const accentedTarget = VN_UNACCENTED_PLACES[lowerClean];
        const accentedDbResult = lookupDirectFromDb(accentedTarget, lang);
        if (accentedDbResult.exists) {
            return {
                exists: true,
                word: accentedDbResult.word,
                results: accentedDbResult.results.map(r => ({
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`
                }))
            };
        }
        const placeRes = getPlaceOrName(accentedTarget);
        if (placeRes && placeRes.length > 0) {
            const filtered = lang ? placeRes.filter(r => r.lang_code === lang) : placeRes;
            if (filtered.length > 0) {
                return {
                    exists: true,
                    word: accentedTarget,
                    results: filtered
                };
            }
        }
    }

    // 2. Tra cứu trực tiếp từ SQLite Database
    const dbResult = lookupDirectFromDb(cleanWord, lang);
    if (dbResult.exists) {
        return dbResult;
    }

    // 2.1. Tra cứu Số (Numbers Engine: 0, 1, 100, 2024, 3.14, 1st, 2nd, IV, X...)
    const numberResults = parseNumberEntry(cleanWord);
    if (numberResults && numberResults.length > 0) {
        const filtered = lang ? numberResults.filter(r => r.lang_code === lang) : numberResults;
        if (filtered.length > 0) {
            return {
                exists: true,
                word: cleanWord,
                results: filtered
            };
        }
    }

    // 2.2. Tra cứu Thời gian (Time Engine: 10:30, 10h30, 10:30am, 12:00, 7pm...)
    const timeResults = parseTimeEntry(cleanWord);
    if (timeResults && timeResults.length > 0) {
        const filtered = lang ? timeResults.filter(r => r.lang_code === lang) : timeResults;
        if (filtered.length > 0) {
            return {
                exists: true,
                word: cleanWord,
                results: filtered
            };
        }
    }

    // 3. Tra cứu bảng toàn bộ từ viết tắt tiếng Anh (Contractions Engine: he's, won't, don't, they're...)
    const contraction = getContraction(cleanWord);
    if (contraction) {
        const baseResult = lookupDirectFromDb(contraction.baseWord, lang || 'en');
        if (baseResult.exists) {
            const results = baseResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `${contraction.description} (${contraction.expansion}). Hiển thị nghĩa của từ gốc "${contraction.baseWord}":`,
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
            return {
                exists: true,
                word: cleanWord,
                results
            };
        }
    }

    // 3.1. Tra cứu dạng sở hữu cách tiếng Anh (Possessive: dog's -> dog, teachers' -> teacher)
    const possessive = getPossessive(cleanWord);
    if (possessive) {
        let baseResult = lookupDirectFromDb(possessive.base, lang || 'en');
        if (!baseResult.exists) {
            const placeRes = getPlaceOrName(possessive.base);
            if (placeRes && placeRes.length > 0) {
                baseResult = {
                    exists: true,
                    word: possessive.base,
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
        if (baseResult.exists) {
            const results = baseResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `${possessive.explanation} Hiển thị nghĩa của từ gốc "${possessive.base}":`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Dạng sở hữu cách',
                    sub_pos: 'Sở hữu cách (Possessive case)',
                    source: 'Possessive Engine',
                    links: [possessive.base]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: possessive.base, relation_type: 'Gốc từ' },
                        ...r.relations
                    ]
                };
            });
            return {
                exists: true,
                word: cleanWord,
                results
            };
        }
    }

    // 3.2. Tra cứu biến thể chính tả Anh - Mỹ và từ ghép gạch nối (color <-> colour, well-known <-> well known)
    const spellingVariants = getSpellingVariants(cleanWord);
    for (const variant of spellingVariants) {
        const variantResult = lookupDirectFromDb(variant, lang || 'en');
        if (variantResult.exists) {
            const results = variantResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `Biến thể chính tả (Anh - Mỹ hoặc từ ghép) tương đương với "${variant}". Hiển thị nghĩa:`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Biến thể chính tả',
                    sub_pos: 'US/UK Spelling Variant',
                    source: 'Spelling Engine',
                    links: [variant]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: variant, relation_type: 'Từ chuẩn' },
                        ...r.relations
                    ]
                };
            });
            return {
                exists: true,
                word: cleanWord,
                results
            };
        }
    }

    // 4. Tra cứu tự động hình thái từ (Lemmatizer NLP Engine: bất quy tắc, số nhiều, chia thì, so sánh)
    const lemmas = getLemmas(cleanWord);
    for (const item of lemmas) {
        const lemmaResult = lookupDirectFromDb(item.lemma, lang || 'en');
        if (lemmaResult.exists) {
            const results = lemmaResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `${item.explanation} Hiển thị nghĩa của từ nguyên mẫu "${item.lemma}":`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Dạng biến thể',
                    sub_pos: item.posType === 'noun' ? 'Số nhiều' : item.posType === 'verb' ? 'Chia thì' : 'So sánh',
                    source: 'Lemmatizer NLP',
                    links: [item.lemma]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: item.lemma, relation_type: 'Gốc từ' },
                        ...r.relations
                    ]
                };
            });
            return {
                exists: true,
                word: cleanWord,
                results
            };
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
        const lemmaResult = lookupDirectFromDb(lemma, lang || 'en');
        if (lemmaResult.exists) {
            const results = lemmaResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `Dạng biến thể / số nhiều / chia thì của "${lemma}". Hiển thị nghĩa của từ nguyên mẫu:`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Dạng biến thể',
                    sub_pos: 'Biến thể ngữ pháp',
                    source: 'Hệ thống tự động',
                    links: [lemma]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: lemma, relation_type: 'Gốc từ' },
                        ...r.relations
                    ]
                };
            });
            return {
                exists: true,
                word: cleanWord,
                results
            };
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
        const rootResult = lookupDirectFromDb(cand.root, lang || 'en');
        if (rootResult.exists) {
            const results = rootResult.results.map(r => {
                const noteMeaning: DictionaryMeaning = {
                    definition: `Từ ghép với tiền tố phủ định "${cand.prefix}" mang nghĩa phủ định hoặc trái ngược với "${cand.root}". Hiển thị nghĩa của từ gốc "${cand.root}":`,
                    definition_lang: 'vi',
                    example: null,
                    pos: 'Từ mang tiền tố',
                    sub_pos: 'Tiền tố phủ định (Negative Prefix)',
                    source: 'Prefix Engine',
                    links: [cand.root]
                };
                return {
                    ...r,
                    audio: `/api/v1/tts?word=${encodeURIComponent(cleanWord)}&lang=${r.lang_code}`,
                    meanings: [noteMeaning, ...r.meanings],
                    relations: [
                        { related_word: cand.root, relation_type: 'Từ gốc' },
                        ...r.relations
                    ]
                };
            });
            return {
                exists: true,
                word: cleanWord,
                results
            };
        }
    }

    // 7. Làm sạch dấu câu dư thừa ở đầu và cuối chuỗi (Punctuation Trimming Fallback)
    // Ví dụ: "hello.", "word?", "apple,", "“vietnam”", "(example)"
    const stripped = cleanWord.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (stripped && stripped !== cleanWord && stripped.length >= 1) {
        const retryResult = lookupWordSync(stripped, lang);
        if (retryResult.exists) {
            return {
                ...retryResult,
                word: cleanWord
            };
        }
    }

    return { exists: false, word: normalizeVietnamese(cleanWord.normalize('NFC').toLowerCase()), results: [] };
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
        return syncResult;
    }

    // 1. Nếu hệ thống offline chưa có, tự động tra cứu Bách khoa toàn thư Wikipedia (địa danh, tên riêng, văn hóa)
    try {
        const wikiResult = await lookupWikiFallback(word, lang);
        if (wikiResult && wikiResult.exists) {
            return wikiResult;
        }
    } catch (e) {
        console.error('Wikipedia fallback error:', e);
    }

    // 2. Tra cứu Wiktionary & Từ điển Mở cho từ chuyên ngành, từ y khoa/khoa học cực hiếm, biến thể ngữ pháp hiếm
    try {
        const wiktionaryResult = await lookupWiktionaryFallback(word, lang);
        if (wiktionaryResult && wiktionaryResult.exists) {
            return wiktionaryResult;
        }
    } catch (e) {
        console.error('Wiktionary fallback error:', e);
    }

    return syncResult;
}

// Prepared statement for suggestions (lazy loaded)
let suggestStmt: Database.Statement | null = null;

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

    const placesSuggestions = (!lang || lang === 'vi' || lang === 'en')
        ? getPlacesSuggestions(cleanPrefix, limit)
        : [];

    const database = getDb();
    const normalizedPrefix = normalizeVietnamese(prefix.normalize('NFC').toLowerCase());
    let dbRows: string[] = [];

    if (lang) {
        const stmt = database.prepare(`
            SELECT DISTINCT word FROM words 
            WHERE word LIKE ? || '%' AND lang_code = ?
            ORDER BY LENGTH(word), word
            LIMIT ?
        `);
        const rows = stmt.all(normalizedPrefix, lang, limit) as { word: string }[];
        dbRows = rows.map(r => r.word);
    } else {
        if (!suggestStmt) {
            suggestStmt = database.prepare(`
                SELECT DISTINCT word FROM words 
                WHERE word LIKE ? || '%' 
                ORDER BY 
                    CASE lang_code WHEN 'vi' THEN 0 ELSE 1 END,
                    LENGTH(word), word
                LIMIT ?
            `);
        }
        const rows = suggestStmt.all(normalizedPrefix, limit) as { word: string }[];
        dbRows = rows.map(r => r.word);
    }

    // Gộp gợi ý từ Custom Words, Contractions, Places và Database, loại bỏ trùng lặp
    const merged = Array.from(new Set([...customList, ...contractionSuggestions, ...placesSuggestions, ...dbRows]));
    return merged.slice(0, limit);
}
