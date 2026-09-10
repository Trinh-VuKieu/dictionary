import { MultiLookupResult, LanguageResult } from './dictionary';
import { getSynonymsAndAntonyms, getThesaurusEntry } from './synonyms_antonyms';

interface WikiSummaryResponse {
    type?: string;
    title: string;
    displaytitle?: string;
    description?: string;
    extract: string;
    extract_html?: string;
    thumbnail?: {
        source: string;
        width: number;
        height: number;
    };
    content_urls?: {
        desktop?: {
            page?: string;
        };
    };
}

// In-memory cache with simple LRU/Map eviction
const WIKI_CACHE = new Map<string, MultiLookupResult>();
const MAX_CACHE_SIZE = 500;

function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Tra cứu thông tin bách khoa Wikipedia cho bất kỳ thực thể nào:
 * Địa danh, sông hồ, núi non, quốc gia, nhân vật lịch sử, danh lam thắng cảnh, văn hóa, khoa học...
 * @param query Từ khóa tìm kiếm
 * @param preferredLang Ngôn ngữ ưu tiên ('vi' hoặc 'en')
 */
export async function lookupWikiFallback(query: string, preferredLang?: string): Promise<MultiLookupResult | null> {
    const clean = query.trim();
    if (!clean || clean.length < 2) return null;

    // Bỏ qua các chuỗi rác/mã hash ngẫu nhiên (ví dụ chứa cả số và chữ dài không phải tên riêng)
    if (/[0-9]+[a-z]{4,}/i.test(clean) || /[a-z]{4,}[0-9]+/i.test(clean)) {
        return null;
    }

    const cacheKey = `${clean.toLowerCase()}:${preferredLang || 'all'}`;
    if (WIKI_CACHE.has(cacheKey)) {
        return WIKI_CACHE.get(cacheKey)!;
    }

    // Danh sách các biến thể tiêu đề cần thử nghiệm
    const candidates = [clean];
    const titleCased = toTitleCase(clean);
    if (titleCased !== clean) candidates.push(titleCased);
    const upperCased = clean.toUpperCase();
    if (!candidates.includes(upperCased)) candidates.push(upperCased);

    // Thứ tự ngôn ngữ thử nghiệm: nếu chỉ định lang thì ưu tiên lang đó trước
    const langs = preferredLang
        ? (preferredLang === 'en' ? ['en', 'vi'] : ['vi', 'en'])
        : ['vi', 'en'];

    for (const lang of langs) {
        for (const candidate of candidates) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'DictionaryApp/1.0 (https://dictionary-nine-sage.vercel.app; contact@dictionary.com)',
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = (await res.json()) as WikiSummaryResponse;

                    // Bỏ qua tuyệt đối mọi trang định hướng (disambiguation) từ Wikipedia
                    const isDisambiguation =
                        data.type === 'disambiguation' ||
                        data.description?.toLowerCase().includes('topics referred to by the same term') ||
                        data.description?.toLowerCase().includes('disambiguation') ||
                        data.extract?.includes('may refer to:') ||
                        data.extract?.includes('có thể là:') ||
                        /refer to:\s*$/i.test(data.extract || '');

                    if (isDisambiguation) {
                        continue;
                    }

                    // Bỏ qua các chuyển hướng (redirect) chiếm đoạt sang tiêu đề hoàn toàn khác biệt
                    // (Ví dụ điển hình: người dùng tra "miniscule", Wikipedia tự redirect sang "Letter case")
                    const queryNorm = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const titleNorm = (data.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (queryNorm.length >= 3 && titleNorm.length >= 3) {
                        const isMatch = queryNorm === titleNorm || queryNorm.includes(titleNorm) || titleNorm.includes(queryNorm);
                        if (!isMatch) {
                            continue;
                        }
                    }

                    if (data.extract && data.extract.length > 10) {
                        const langName = lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh';
                        const sourceUrl = data.content_urls?.desktop?.page;
                        const audioWord = clean === clean.toLowerCase() ? clean : (data.title || clean);

                        // Chỉ gán 'Danh từ riêng' nếu từ được viết hoa (như địa danh Hà Nội, nhân vật Einstein)
                        const isProperNoun = /^[A-ZÀ-Ỹ]/.test(clean);
                        const pos = isProperNoun ? 'Danh từ riêng' : 'Thuật ngữ / Bách khoa';

                        const languageResult: LanguageResult = {
                            lang_code: lang,
                            lang_name: langName,
                            audio: `/api/v1/tts?word=${encodeURIComponent(audioWord)}&lang=${lang}`,
                            meanings: [
                                {
                                    definition: data.extract,
                                    definition_lang: lang,
                                    example: data.description ? `📌 ${data.description}` : null,
                                    pos,
                                    sub_pos: data.description || 'Thực thể bách khoa Wikipedia',
                                    source: 'Bách khoa toàn thư Wikipedia',
                                    links: sourceUrl ? [sourceUrl] : []
                                }
                            ],
                            pronunciations: [],
                            translations: [],
                            relations: lang === 'en' ? getSynonymsAndAntonyms(clean) : [],
                            synonyms: lang === 'en' ? (getThesaurusEntry(clean)?.synonyms || []) : [],
                            antonyms: lang === 'en' ? (getThesaurusEntry(clean)?.antonyms || []) : []
                        };

                        const returnWord = clean.toLowerCase() === (data.title || '').toLowerCase() ? clean : (data.title || clean);

                        const lookupResult: MultiLookupResult = {
                            exists: true,
                            word: returnWord,
                            results: [languageResult]
                        };

                        // Lưu vào cache
                        if (WIKI_CACHE.size >= MAX_CACHE_SIZE) {
                            const firstKey = WIKI_CACHE.keys().next().value;
                            if (firstKey) WIKI_CACHE.delete(firstKey);
                        }
                        WIKI_CACHE.set(cacheKey, lookupResult);

                        return lookupResult;
                    }
                }
            } catch {
                // Bỏ qua lỗi mạng/timeout và tiếp tục thử ứng viên tiếp theo
            }
        }
    }

    return null;
}
