import { LanguageResult, DictionaryPronunciation } from './dictionary';

export interface CustomWordEntry {
    word: string;
    aliasTo?: string; // Tùy chọn: Chuyển hướng lấy nghĩa từ từ gốc (ví dụ classes -> class)
    note?: string; // Ghi chú ngữ pháp (ví dụ: Dạng số nhiều của 'class')
    pronunciations?: DictionaryPronunciation[]; // Phiên âm tùy chọn khi dùng aliasTo
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
    },

    // 3.1. Các từ số nhiều thông dụng bị dữ liệu rác hoặc thiếu nghĩa trong SQLite gốc
    "moments": {
        word: "moments",
        aliasTo: "moment",
        note: "Dạng số nhiều của danh từ 'moment' (những khoảnh khắc, giây phút, thời điểm, chốc lát).",
        pronunciations: [{ ipa: "/ˈmoʊ.mənts/", region: "US/UK" }]
    },
    "minutes": {
        word: "minutes",
        aliasTo: "minute",
        note: "Dạng số nhiều của danh từ 'minute' (các phút, khoảng thời gian ngắn) hoặc biên bản cuộc họp.",
        pronunciations: [{ ipa: "/ˈmɪn.ɪts/", region: "US/UK" }]
    },
    "seconds": {
        word: "seconds",
        aliasTo: "second",
        note: "Dạng số nhiều của danh từ 'second' (các giây) hoặc người phụ tá, hàng loại hai.",
        pronunciations: [{ ipa: "/ˈsɛk.əndz/", region: "US/UK" }]
    },
    "glasses": {
        word: "glasses",
        aliasTo: "glass",
        note: "Kính mắt, kính đeo mắt (danh từ số nhiều luôn có đuôi -es) hoặc dạng số nhiều của 'glass' (những chiếc cốc, ly thủy tinh).",
        pronunciations: [{ ipa: "/ˈɡlæs.ɪz/", region: "US/UK" }]
    },
    "books": {
        word: "books",
        aliasTo: "book",
        note: "Dạng số nhiều của danh từ 'book' (những cuốn sách, quyển vở).",
        pronunciations: [{ ipa: "/bʊks/", region: "US/UK" }]
    },
    "children": {
        word: "children",
        aliasTo: "child",
        note: "Dạng số nhiều (bất quy tắc) của danh từ 'child' (những đứa trẻ, các con).",
        pronunciations: [{ ipa: "/ˈtʃɪl.drən/", region: "US/UK" }]
    },

    // 4. Các từ cơ bản tiếng Anh bị thiếu trong database gốc
    "why": {
        word: "why",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=why&lang=en",
            meanings: [
                { definition: "Tại sao, vì sao (từ để hỏi nguyên nhân, lý do).", definition_lang: "vi", example: "Why are you late? / Tell me why.", pos: "Phó từ / Đại từ nghi vấn", sub_pos: null, source: "Custom", links: [] },
                { definition: "Lý do, nguyên cớ (danh từ).", definition_lang: "vi", example: "the whys and wherefores (lý do ngọn ngành)", pos: "Danh từ", sub_pos: null, source: "Custom", links: [] }
            ],
            pronunciations: [{ ipa: "/waɪ/", region: "UK/US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "tại sao / vì sao" }],
            relations: []
        }]
    },

    "which": {
        word: "which",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=which&lang=en",
            meanings: [
                { definition: "Nào, cái nào, người nào (dùng để hỏi hoặc lựa chọn giữa các đối tượng).", definition_lang: "vi", example: "Which color do you prefer?", pos: "Đại từ nghi vấn", sub_pos: null, source: "Custom", links: [] },
                { definition: "Mà, điều mà (đại từ quan hệ thay thế cho sự vật, sự việc).", definition_lang: "vi", example: "The book which I bought yesterday.", pos: "Đại từ quan hệ", sub_pos: null, source: "Custom", links: [] }
            ],
            pronunciations: [{ ipa: "/wɪtʃ/", region: "UK/US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "cái nào / mà" }],
            relations: []
        }]
    },

    "whose": {
        word: "whose",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=whose&lang=en",
            meanings: [
                { definition: "Của ai (từ để hỏi về quyền sở hữu).", definition_lang: "vi", example: "Whose coat is this?", pos: "Đại từ nghi vấn", sub_pos: null, source: "Custom", links: ["who"] },
                { definition: "Của người mà, mà có (đại từ quan hệ chỉ sở hữu).", definition_lang: "vi", example: "A woman whose car was stolen.", pos: "Đại từ quan hệ", sub_pos: null, source: "Custom", links: [] }
            ],
            pronunciations: [{ ipa: "/huːz/", region: "UK/US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "của ai" }],
            relations: [{ related_word: "who", relation_type: "Gốc từ" }]
        }]
    },

    "only": {
        word: "only",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=only&lang=en",
            meanings: [
                { definition: "Chỉ, duy nhất (phó từ).", definition_lang: "vi", example: "I only have five dollars. / If only I knew.", pos: "Phó từ", sub_pos: null, source: "Custom", links: [] },
                { definition: "Duy nhất, độc nhất (tính từ).", definition_lang: "vi", example: "an only child (con một) / the only way", pos: "Tính từ", sub_pos: null, source: "Custom", links: [] }
            ],
            pronunciations: [{ ipa: "/ˈəʊn.li/", region: "UK" }, { ipa: "/ˈoʊn.li/", region: "US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "chỉ / duy nhất" }],
            relations: []
        }]
    },

    "quite": {
        word: "quite",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=quite&lang=en",
            meanings: [
                { definition: "Khá, tương đối (mức độ trung bình).", definition_lang: "vi", example: "It's quite warm today.", pos: "Phó từ", sub_pos: null, source: "Custom", links: [] },
                { definition: "Hoàn toàn, tuyệt đối.", definition_lang: "vi", example: "I'm not quite sure.", pos: "Phó từ", sub_pos: null, source: "Custom", links: [] }
            ],
            pronunciations: [{ ipa: "/kwaɪt/", region: "UK/US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "khá / hoàn toàn" }],
            relations: []
        }]
    },

    "hers": {
        word: "hers",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=hers&lang=en",
            meanings: [
                { definition: "Của cô ấy, của bà ấy (đại từ sở hữu thay thế cho danh từ).", definition_lang: "vi", example: "This bag is hers.", pos: "Đại từ", sub_pos: "Đại từ sở hữu", source: "Custom", links: ["her", "she"] }
            ],
            pronunciations: [{ ipa: "/hɜːz/", region: "UK" }, { ipa: "/hɝːz/", region: "US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "của cô ấy" }],
            relations: [{ related_word: "she", relation_type: "Gốc từ" }, { related_word: "her", relation_type: "Liên quan" }]
        }]
    },

    "theirs": {
        word: "theirs",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=theirs&lang=en",
            meanings: [
                { definition: "Của họ, của chúng nó (đại từ sở hữu thay thế cho danh từ).", definition_lang: "vi", example: "That house is theirs.", pos: "Đại từ", sub_pos: "Đại từ sở hữu", source: "Custom", links: ["their", "they"] }
            ],
            pronunciations: [{ ipa: "/ðeəz/", region: "UK" }, { ipa: "/ðerz/", region: "US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "của họ" }],
            relations: [{ related_word: "they", relation_type: "Gốc từ" }, { related_word: "their", relation_type: "Liên quan" }]
        }]
    },

    "yourself": {
        word: "yourself",
        aliasTo: "you",
        note: "Đại từ phản thân của 'you' (chính bạn / tự bản thân bạn). Ví dụ: Take care of yourself."
    },

    "yourselves": {
        word: "yourselves",
        aliasTo: "you",
        note: "Đại từ phản thân số nhiều của 'you' (chính các bạn / tự bản thân các bạn). Ví dụ: Help yourselves."
    },

    "himself": {
        word: "himself",
        aliasTo: "he",
        note: "Đại từ phản thân của 'he' (chính anh ấy / tự bản thân anh ấy). Ví dụ: He did it himself."
    },

    "herself": {
        word: "herself",
        aliasTo: "she",
        note: "Đại từ phản thân của 'she' (chính cô ấy / tự bản thân cô ấy). Ví dụ: She lives by herself."
    },

    "ourselves": {
        word: "ourselves",
        aliasTo: "we",
        note: "Đại từ phản thân của 'we' (chính chúng tôi / chính chúng ta). Ví dụ: We saw it ourselves."
    },

    "themselves": {
        word: "themselves",
        aliasTo: "they",
        note: "Đại từ phản thân của 'they' (chính họ / chính chúng nó). Ví dụ: They solved the problem themselves."
    },

    "having": {
        word: "having",
        aliasTo: "have",
        note: "Dạng phân từ hiện tại (present participle) hoặc danh động từ (gerund) của động từ 'have' (đang có, trải qua)."
    },

    "o'clock": {
        word: "o'clock",
        results: [{
            lang_code: "en",
            lang_name: "Tiếng Anh",
            audio: "/api/v1/tts?word=o'clock&lang=en",
            meanings: [
                { definition: "Giờ đúng (viết tắt của 'of the clock', dùng sau số từ để chỉ giờ chính xác).", definition_lang: "vi", example: "It's 7 o'clock in the morning.", pos: "Phó từ / Thành ngữ", sub_pos: "Chỉ thời gian", source: "Custom", links: ["clock", "time"] }
            ],
            pronunciations: [{ ipa: "/əˈklɒk/", region: "UK" }, { ipa: "/əˈklɑːk/", region: "US" }],
            translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "giờ đúng" }],
            relations: [{ related_word: "clock", relation_type: "Gốc từ" }]
        }]
    },

    "apr": {
        word: "apr",
        aliasTo: "april",
        note: "Dạng viết tắt của tháng Tư (April)."
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
