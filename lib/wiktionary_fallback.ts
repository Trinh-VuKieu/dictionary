import { MultiLookupResult, LanguageResult, DictionaryMeaning } from './dictionary';
import { getEnglishPhoneticFallback } from './english_phonetics';
import { getSynonymsAndAntonyms, getThesaurusEntry } from './synonyms_antonyms';

// In-memory cache for Wiktionary definitions
const WIKTIONARY_CACHE = new Map<string, MultiLookupResult>();
const MAX_CACHE_SIZE = 1000;

function stripHtml(html: string): string {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<[^>]+>/g, '')
        .trim();
}

/**
 * Bộ dịch đa tầng tự động (Multi-tier Translation Engine)
 * Tầng 1: Google GTX API
 * Tầng 2: Google Mobile Web Mirror (không bị rate limit 429)
 * Tầng 3: MyMemory Translation API
 */
async function translateToVietnamese(text: string, signal?: AbortSignal): Promise<string> {
    const cleanText = text.trim();
    if (!cleanText) return '';

    // Tầng 1: Google GTX
    try {
        const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(gtxUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                const trans = String(data[0][0][0]).trim();
                if (trans && trans.toLowerCase() !== cleanText.toLowerCase()) {
                    return trans;
                }
            }
        }
    } catch {
        // Tiếp tục thử Tầng 2
    }

    // Tầng 2: Google Mobile Web Mirror (cực kỳ ổn định, không chặn 429)
    try {
        const mUrl = `https://translate.google.com/m?sl=auto&tl=vi&q=${encodeURIComponent(cleanText)}`;
        const res = await fetch(mUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
            signal
        });
        if (res.ok) {
            const html = await res.text();
            const match = html.match(/class="result-container">([^<]+)<\/div>/);
            if (match && match[1]) {
                const trans = stripHtml(match[1]);
                if (trans && trans.toLowerCase() !== cleanText.toLowerCase()) {
                    return trans;
                }
            }
        }
    } catch {
        // Tiếp tục thử Tầng 3
    }

    // Tầng 3: MyMemory Translation API
    try {
        const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|vi`;
        const res = await fetch(mmUrl, {
            headers: { 'User-Agent': 'DictionaryApp/1.0' },
            signal
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.responseData && data.responseData.translatedText) {
                const trans = String(data.responseData.translatedText).trim();
                if (trans && trans.toLowerCase() !== cleanText.toLowerCase() && !trans.includes('MYMEMORY WARNING')) {
                    return trans;
                }
            }
        }
    } catch {
        // Hết các tầng
    }

    return '';
}

/**
 * Tra cứu bổ trợ Wiktionary & Từ điển mở cho các từ vựng chuyên ngành,
 * từ y học/khoa học cực hiếm (ví dụ: thyroparathyroidectomized, pneumonoultramicroscopicsilicovolcanoconiosis),
 * tiếng lóng mới, hoặc các dạng biến thể ngữ pháp hiếm.
 */
export async function lookupWiktionaryFallback(query: string, preferredLang?: string): Promise<MultiLookupResult | null> {
    const clean = query.trim().replace(/[’‘`]/g, "'").replace(/-{2,}/g, '-');
    if (!clean || clean.length < 2) return null;

    // Bỏ qua chuỗi hash vô nghĩa (vừa số vừa chữ ngẫu nhiên dài)
    if (/[0-9]+[a-z]{4,}/i.test(clean) || /[a-z]{4,}[0-9]+/i.test(clean)) {
        return null;
    }

    const cacheKey = `${clean.toLowerCase()}:${preferredLang || 'all'}`;
    if (WIKTIONARY_CACHE.has(cacheKey)) {
        return WIKTIONARY_CACHE.get(cacheKey)!;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        // 1. Lấy định nghĩa chi tiết từ Wiktionary REST API (thử chữ thường, nếu không có thử chữ gốc)
        const fetchWiktionary = async (term: string) => {
            const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}`;
            return fetch(url, {
                headers: { 'User-Agent': 'DictionaryApp/1.0 (https://dictionary-nine-sage.vercel.app)' },
                signal: controller.signal
            }).then(r => r.ok ? r.json() : null).catch(() => null);
        };

        const wiktionaryPromise = fetchWiktionary(clean.toLowerCase()).then(async (data) => {
            if (data && Array.isArray(data.en) && data.en.length > 0) return data;
            if (clean !== clean.toLowerCase()) {
                const originalData = await fetchWiktionary(clean);
                if (originalData && Array.isArray(originalData.en) && originalData.en.length > 0) return originalData;
            }
            // Nếu là từ ghép có gạch nối như long-dormant, thử tìm dạng khoảng trắng
            if (clean.includes('-')) {
                const spaceForm = clean.replace(/-/g, ' ');
                return fetchWiktionary(spaceForm);
            }
            return data;
        });

        // 2. Lấy bản dịch tiếng Việt song song qua hệ thống dịch đa tầng
        const translationPromise = translateToVietnamese(clean, controller.signal);

        const [wiktionaryData, viTranslation] = await Promise.all([wiktionaryPromise, translationPromise]);
        clearTimeout(timeoutId);

        const meanings: DictionaryMeaning[] = [];

        // Nếu Wiktionary có dữ liệu:
        if (wiktionaryData && Array.isArray(wiktionaryData.en) && wiktionaryData.en.length > 0) {
            for (const section of wiktionaryData.en) {
                const pos = section.partOfSpeech || 'Từ vựng';
                if (Array.isArray(section.definitions)) {
                    for (const defObj of section.definitions) {
                        const cleanDef = stripHtml(defObj.definition || '');
                        if (cleanDef && cleanDef.length > 3) {
                            meanings.push({
                                pos: pos,
                                sub_pos: null,
                                definition: cleanDef,
                                definition_lang: 'en',
                                example: defObj.examples && defObj.examples.length > 0 ? stripHtml(defObj.examples[0]) : null,
                                source: 'Wiktionary',
                                links: []
                            });
                        }
                    }
                }
            }
        }

        // Thêm nghĩa tiếng Việt nếu có
        const subLinks: string[] = [];
        if (clean.includes('-')) {
            subLinks.push(...clean.split('-').filter(part => part.length > 2));
        }

        if (viTranslation && viTranslation.toLowerCase() !== clean.toLowerCase()) {
            meanings.unshift({
                pos: meanings.length > 0 ? meanings[0].pos : 'Từ vựng',
                sub_pos: clean.includes('-') ? 'Từ ghép (Compound)' : null,
                definition: viTranslation,
                definition_lang: 'vi',
                example: null,
                source: 'Từ điển dịch',
                links: subLinks
            });
        }

        // Đảm bảo luôn có ít nhất một định nghĩa tiếng Anh để hỗ trợ tham số def_lang=en
        if (meanings.length > 0 && !meanings.some(m => m.definition_lang === 'en')) {
            const spaceForm = clean.replace(/-/g, ' ');
            meanings.push({
                pos: meanings[0].pos || 'Từ vựng',
                sub_pos: clean.includes('-') ? 'Compound term' : null,
                definition: `Compound or descriptive phrase equivalent to "${spaceForm}".`,
                definition_lang: 'en',
                example: null,
                source: 'Từ điển dịch',
                links: subLinks
            });
        }

        if (meanings.length > 0) {
            const thesaurusRels = getSynonymsAndAntonyms(clean);
            const thesaurusData = getThesaurusEntry(clean);
            const langResult: LanguageResult = {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(clean)}&lang=en`,
                meanings,
                pronunciations: getEnglishPhoneticFallback(clean) || [],
                translations: [],
                relations: thesaurusRels,
                synonyms: thesaurusData?.synonyms || [],
                antonyms: thesaurusData?.antonyms || []
            };

            const result: MultiLookupResult = {
                exists: true,
                word: clean,
                results: [langResult]
            };

            if (WIKTIONARY_CACHE.size >= MAX_CACHE_SIZE) {
                const first = WIKTIONARY_CACHE.keys().next().value;
                if (first) WIKTIONARY_CACHE.delete(first);
            }
            WIKTIONARY_CACHE.set(cacheKey, result);

            return result;
        }
    } catch {
        // Fallback thất bại thì trả về null
    }

    return null;
}
