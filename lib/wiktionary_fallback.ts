import { MultiLookupResult, LanguageResult, DictionaryMeaning } from './dictionary';

// In-memory cache for Wiktionary definitions
const WIKTIONARY_CACHE = new Map<string, MultiLookupResult>();
const MAX_CACHE_SIZE = 1000;

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Tra cứu bổ trợ Wiktionary & Từ điển mở cho các từ vựng chuyên ngành,
 * từ y học/khoa học cực hiếm (ví dụ: thyroparathyroidectomized, pneumonoultramicroscopicsilicovolcanoconiosis),
 * tiếng lóng mới, hoặc các dạng biến thể ngữ pháp hiếm.
 */
export async function lookupWiktionaryFallback(query: string, preferredLang?: string): Promise<MultiLookupResult | null> {
    const clean = query.trim();
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
        const timeoutId = setTimeout(() => controller.abort(), 3500);

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
                return fetchWiktionary(clean);
            }
            return data;
        });

        // 2. Lấy bản dịch tiếng Việt song song từ Google Translate
        const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(clean)}`;
        const gtxPromise = fetch(gtxUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal
        }).then(r => r.ok ? r.json() : null).catch(() => null);

        const [wiktionaryData, gtxData] = await Promise.all([wiktionaryPromise, gtxPromise]);
        clearTimeout(timeoutId);

        const meanings: DictionaryMeaning[] = [];

        // Trích xuất bản dịch tiếng Việt từ Google
        let viTranslation = '';
        if (gtxData && gtxData[0] && gtxData[0][0] && gtxData[0][0][0]) {
            viTranslation = gtxData[0][0][0];
        }

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
        if (viTranslation && viTranslation.toLowerCase() !== clean.toLowerCase()) {
            meanings.unshift({
                pos: meanings.length > 0 ? meanings[0].pos : 'Từ vựng',
                sub_pos: null,
                definition: viTranslation,
                definition_lang: 'vi',
                example: null,
                source: 'Từ điển dịch',
                links: []
            });
        }

        if (meanings.length > 0) {
            const langResult: LanguageResult = {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(clean)}&lang=en`,
                meanings,
                pronunciations: [],
                translations: [],
                relations: []
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
