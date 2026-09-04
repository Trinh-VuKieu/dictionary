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
