import { MultiLookupResult, LanguageResult } from './dictionary';

export interface CustomWordEntry {
    word: string;
    aliasTo?: string; // Tùy chọn: Chuyển hướng lấy nghĩa từ từ gốc (ví dụ classes -> class)
    note?: string; // Ghi chú ngữ pháp (ví dụ: Dạng số nhiều của 'class')
    results?: LanguageResult[]; // Dữ liệu định nghĩa tùy chỉnh riêng
}

/**
 * Danh sách từ vựng bổ sung tùy chỉnh (Custom Words)
 * Bạn có thể dễ dàng thêm bất kỳ từ nào vào đây theo 2 cách:
 *
 * Cách 1: Định nghĩa nội dung chi tiết riêng cho từ đó (như từ "he's")
 * Cách 2: Trỏ về từ gốc (aliasTo) kèm ghi chú ngữ pháp (như "classes" -> trỏ về "class")
 */
export const CUSTOM_WORDS: Record<string, CustomWordEntry> = {
    // 0. Từ "my" (bị thiếu trong database gốc)
    "my": {
        word: "my",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=my&lang=en",
                meanings: [
                    {
                        definition: "Của tôi (tính từ sở hữu, đứng trước danh từ).",
                        definition_lang: "vi",
                        example: "This is my book. / My name is John.",
                        pos: "Đại từ",
                        sub_pos: "Tính từ sở hữu",
                        source: "Custom",
                        links: ["I", "me", "mine"]
                    },
                    {
                        definition: "Of or belonging to me (used to indicate that something belongs to or relates to the speaker).",
                        definition_lang: "en",
                        example: "My family lives here.",
                        pos: "Pronoun",
                        sub_pos: "Possessive determiner",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "Trời ơi! (thán từ biểu lộ sự ngạc nhiên, thường dùng: My, my! hoặc My goodness!).",
                        definition_lang: "vi",
                        example: "My, my! What a lovely surprise!",
                        pos: "Thán từ",
                        sub_pos: null,
                        source: "Custom",
                        links: []
                    }
                ],
                pronunciations: [
                    { ipa: "/maɪ/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "của tôi" }
                ],
                relations: [
                    { related_word: "I", relation_type: "Gốc từ" },
                    { related_word: "me", relation_type: "Liên quan" },
                    { related_word: "mine", relation_type: "Đại từ sở hữu" }
                ]
            },
            {
                lang_code: "vi",
                lang_name: "Tiếng Việt",
                audio: "/api/v1/tts?word=m%E1%BB%B9&lang=vi",
                meanings: [
                    {
                        definition: "Nước Mỹ (Hợp chúng quốc Hoa Kỳ).",
                        definition_lang: "vi",
                        example: "Đi du học Mỹ.",
                        pos: "Danh từ",
                        sub_pos: "Danh từ riêng",
                        source: "Custom",
                        links: ["hoa kỳ"]
                    },
                    {
                        definition: "Đẹp, tốt lành (yếu tố Hán-Việt trong: mỹ thuật, mỹ mãn, hoa mỹ, mỹ lệ).",
                        definition_lang: "vi",
                        example: "Tác phẩm mỹ thuật.",
                        pos: "Tính từ",
                        sub_pos: null,
                        source: "Custom",
                        links: []
                    }
                ],
                pronunciations: [
                    { ipa: "mi˧ˀ˥", region: "Hà Nội" }
                ],
                translations: [],
                relations: []
            }
        ]
    },

    // 0.1. Từ "his"
    "his": {
        word: "his",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=his&lang=en",
                meanings: [
                    {
                        definition: "Của anh ấy, của ông ấy, của nó (chỉ người hoặc động vật đực).",
                        definition_lang: "vi",
                        example: "His father is a doctor. / That car is his.",
                        pos: "Đại từ",
                        sub_pos: "Tính từ sở hữu / Đại từ sở hữu",
                        source: "Custom",
                        links: ["he", "him"]
                    }
                ],
                pronunciations: [
                    { ipa: "/hɪz/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "của anh ấy" }
                ],
                relations: [
                    { related_word: "he", relation_type: "Gốc từ" }
                ]
            }
        ]
    },

    // 0.2. Từ "these" (số nhiều của this)
    "these": {
        word: "these",
        aliasTo: "this",
        note: "Dạng số nhiều của đại từ / tính từ chỉ định 'this' (những cái này, những người này)."
    },

    // 1. Từ viết tắt "he's"
    "he's": {
        word: "he's",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=he's&lang=en",
                meanings: [
                    {
                        definition: "Dạng viết tắt của 'he is' (anh ấy là/thì/ở) hoặc 'he has' (anh ấy có/đã).",
                        definition_lang: "vi",
                        example: "He's a doctor. (Anh ấy là bác sĩ) / He's gone home. (Anh ấy đã về nhà)",
                        pos: "Đại từ",
                        sub_pos: "Từ viết tắt",
                        source: "Custom",
                        links: ["he", "is", "has"]
                    },
                    {
                        definition: "Contraction of 'he is' or 'he has'.",
                        definition_lang: "en",
                        example: "He's my best friend.",
                        pos: "Pronoun",
                        sub_pos: "Contraction",
                        source: "Custom",
                        links: []
                    }
                ],
                pronunciations: [
                    { ipa: "/hiːz/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "anh ấy là / anh ấy có" }
                ],
                relations: [
                    { related_word: "he", relation_type: "Gốc từ" },
                    { related_word: "is", relation_type: "Liên quan" },
                    { related_word: "has", relation_type: "Liên quan" }
                ]
            }
        ]
    },

    // 2. Từ viết tắt phổ biến tương tự
    "she's": {
        word: "she's",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=she's&lang=en",
                meanings: [
                    {
                        definition: "Dạng viết tắt của 'she is' (cô ấy là/thì/ở) hoặc 'she has' (cô ấy có/đã).",
                        definition_lang: "vi",
                        example: "She's a teacher. / She's finished her homework.",
                        pos: "Đại từ",
                        sub_pos: "Từ viết tắt",
                        source: "Custom",
                        links: ["she", "is", "has"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ʃiːz/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "cô ấy là / cô ấy có" }
                ],
                relations: [
                    { related_word: "she", relation_type: "Gốc từ" }
                ]
            }
        ]
    },

    "it's": {
        word: "it's",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=it's&lang=en",
                meanings: [
                    {
                        definition: "Dạng viết tắt của 'it is' (nó là/thì) hoặc 'it has' (nó có/đã).",
                        definition_lang: "vi",
                        example: "It's raining outside.",
                        pos: "Đại từ",
                        sub_pos: "Từ viết tắt",
                        source: "Custom",
                        links: ["it", "is", "has"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ɪts/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "nó là / nó có" }
                ],
                relations: [
                    { related_word: "it", relation_type: "Gốc từ" }
                ]
            }
        ]
    },

    // 3. Từ số nhiều "classes" (Trỏ về "class" và kèm ghi chú)
    "classes": {
        word: "classes",
        aliasTo: "class",
        note: "Dạng số nhiều của danh từ 'class' (các lớp học, các tầng lớp) hoặc dạng chia ngôi thứ 3 số ít thì hiện tại đơn của động từ 'class' (phân loại)."
    }
};

/**
 * Kiểm tra xem từ có trong danh sách Custom không
 */
export function getCustomWord(word: string): CustomWordEntry | undefined {
    const key = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    return CUSTOM_WORDS[key];
}

/**
 * Lấy danh sách gợi ý từ Custom Words
 */
export function getCustomSuggestions(prefix: string, limit: number = 8): string[] {
    const normalized = prefix.trim().toLowerCase().replace(/[’‘`]/g, "'");
    if (!normalized) return [];

    return Object.keys(CUSTOM_WORDS)
        .filter(w => w.startsWith(normalized))
        .slice(0, limit);
}
