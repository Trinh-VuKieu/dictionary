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

    // 0.3. Động từ To Be & Giờ giấc (am, is, are, was, were, been, being, pm, a.m., p.m.)
    "am": {
        word: "am",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=am&lang=en",
                meanings: [
                    {
                        definition: "Thì, là, ở, bị, được (dạng chia thì hiện tại đơn của động từ to be, đi với chủ ngữ ngôi thứ nhất số ít 'I').",
                        definition_lang: "vi",
                        example: "I am a student. / I am 20 years old. / I am ready.",
                        pos: "Động từ",
                        sub_pos: "Động từ to be (Ngôi thứ nhất số ít)",
                        source: "Custom",
                        links: ["be", "is", "are"]
                    },
                    {
                        definition: "Giờ buổi sáng (từ 00:00 nửa đêm đến 11:59 trưa). Viết tắt của cụm từ tiếng Latin 'ante meridiem' (trước buổi trưa). Thường viết dưới dạng: am, a.m., AM hoặc A.M.",
                        definition_lang: "vi",
                        example: "The train leaves at 7:00 am. / I wake up at 6 am every day.",
                        pos: "Phó từ / Viết tắt",
                        sub_pos: "Chỉ thời gian (Time)",
                        source: "Custom",
                        links: ["pm", "time", "clock"]
                    },
                    {
                        definition: "Sóng phát thanh AM (viết tắt của Amplitude Modulation - điều chế biên độ tần số vô tuyến, phân biệt với sóng FM).",
                        definition_lang: "vi",
                        example: "Listen to the morning news on an AM radio station.",
                        pos: "Danh từ / Viết tắt",
                        sub_pos: "Kỹ thuật viễn thông",
                        source: "Custom",
                        links: ["radio", "fm"]
                    },
                    {
                        definition: "First-person singular present tense of the verb 'be' (used with 'I').",
                        definition_lang: "en",
                        example: "I am here.",
                        pos: "Verb",
                        sub_pos: "Auxiliary / Linking verb",
                        source: "Custom",
                        links: ["be"]
                    },
                    {
                        definition: "Ante meridiem: before noon (used to refer to the time from midnight to noon).",
                        definition_lang: "en",
                        example: "Classes start at 8:30 am.",
                        pos: "Adverb",
                        sub_pos: "Time expression",
                        source: "Custom",
                        links: ["pm"]
                    }
                ],
                pronunciations: [
                    { ipa: "/æm/", region: "Động từ (nhấn mạnh)" },
                    { ipa: "/əm/", region: "Động từ (dạng yếu)" },
                    { ipa: "/ˌeɪ ˈem/", region: "Giờ giấc (A.M.)" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "thì, là, ở" },
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "giờ sáng (trước 12h trưa)" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" },
                    { related_word: "pm", relation_type: "Đối lập thời gian (chiều/tối)" },
                    { related_word: "is", relation_type: "Ngôi thứ 3 số ít" },
                    { related_word: "are", relation_type: "Số nhiều" }
                ]
            },
            {
                lang_code: "vi",
                lang_name: "Tiếng Việt",
                audio: "/api/v1/tts?word=am&lang=vi",
                meanings: [
                    {
                        definition: "Chùa nhỏ, miếu nhỏ, nơi thờ tự hoặc tu hành thanh tịnh.",
                        definition_lang: "vi",
                        example: "Ngôi am nhỏ nằm ẩn mình dưới bóng cây cổ thụ.",
                        pos: "Danh từ",
                        sub_pos: "Danh từ chỉ nơi chốn",
                        source: "Custom",
                        links: ["chùa", "miếu"]
                    }
                ],
                pronunciations: [
                    { ipa: "/aːm/", region: "Toàn quốc" }
                ],
                translations: [],
                relations: []
            }
        ]
    },

    "is": {
        word: "is",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=is&lang=en",
                meanings: [
                    {
                        definition: "Thì, là, ở, bị, được (dạng chia thì hiện tại đơn của động từ to be, đi với chủ ngữ ngôi thứ ba số ít: he, she, it hoặc danh từ số ít).",
                        definition_lang: "vi",
                        example: "He is a doctor. / She is very kind. / Hanoi is the capital of Vietnam.",
                        pos: "Động từ",
                        sub_pos: "Động từ to be (Ngôi thứ ba số ít)",
                        source: "Custom",
                        links: ["be", "am", "are", "was"]
                    },
                    {
                        definition: "Third-person singular present tense of 'be' (used with he, she, it, or singular nouns).",
                        definition_lang: "en",
                        example: "The water is cold.",
                        pos: "Verb",
                        sub_pos: "Auxiliary / Linking verb",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ɪz/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "thì, là, ở" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" },
                    { related_word: "am", relation_type: "Ngôi thứ nhất số ít" },
                    { related_word: "are", relation_type: "Số nhiều / ngôi thứ 2" }
                ]
            }
        ]
    },

    "are": {
        word: "are",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=are&lang=en",
                meanings: [
                    {
                        definition: "Thì, là, ở (dạng chia thì hiện tại đơn của động từ to be, đi với chủ ngữ ngôi thứ hai 'you' hoặc ngôi số nhiều 'we', 'they', danh từ số nhiều).",
                        definition_lang: "vi",
                        example: "You are welcome. / We are friends. / They are studying.",
                        pos: "Động từ",
                        sub_pos: "Động từ to be (Số nhiều & Ngôi thứ hai)",
                        source: "Custom",
                        links: ["be", "am", "is", "were"]
                    },
                    {
                        definition: "Đơn vị đo diện tích ruộng đất bằng 100 mét vuông (1 are = 100 m²).",
                        definition_lang: "vi",
                        example: "The plot of land measures 5 ares.",
                        pos: "Danh từ",
                        sub_pos: "Đơn vị đo lường",
                        source: "Custom",
                        links: ["hectare", "meter"]
                    },
                    {
                        definition: "Present tense of 'be' used with you, we, they, and plural nouns.",
                        definition_lang: "en",
                        example: "Where are they going?",
                        pos: "Verb",
                        sub_pos: "Auxiliary / Linking verb",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ɑːr/", region: "US/UK (nhấn mạnh)" },
                    { ipa: "/ər/", region: "US/UK (dạng yếu)" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "thì, là, ở" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" },
                    { related_word: "am", relation_type: "Ngôi thứ nhất số ít" },
                    { related_word: "is", relation_type: "Ngôi thứ 3 số ít" }
                ]
            }
        ]
    },

    "was": {
        word: "was",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=was&lang=en",
                meanings: [
                    {
                        definition: "Đã thì, đã là, đã ở (thì quá khứ đơn của động từ to be, dùng cho chủ ngữ ngôi số ít: I, he, she, it, danh từ số ít).",
                        definition_lang: "vi",
                        example: "I was at home yesterday. / He was tired after work.",
                        pos: "Động từ",
                        sub_pos: "Động từ to be (Quá khứ số ít)",
                        source: "Custom",
                        links: ["be", "were", "been"]
                    },
                    {
                        definition: "First- and third-person singular past tense of 'be'.",
                        definition_lang: "en",
                        example: "She was my teacher.",
                        pos: "Verb",
                        sub_pos: "Past tense of be",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/wɒz/", region: "UK" },
                    { ipa: "/wʌz/", region: "US" },
                    { ipa: "/wəz/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "đã là, đã ở (quá khứ)" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" },
                    { related_word: "were", relation_type: "Quá khứ số nhiều" }
                ]
            }
        ]
    },

    "were": {
        word: "were",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=were&lang=en",
                meanings: [
                    {
                        definition: "Đã thì, đã là, đã ở (thì quá khứ đơn của động từ to be, dùng cho chủ ngữ số nhiều hoặc ngôi thứ hai: you, we, they, danh từ số nhiều; và dùng trong câu điều kiện giả định).",
                        definition_lang: "vi",
                        example: "We were very happy. / If I were you, I would accept.",
                        pos: "Động từ",
                        sub_pos: "Động từ to be (Quá khứ số nhiều / Giả định)",
                        source: "Custom",
                        links: ["be", "was", "been"]
                    },
                    {
                        definition: "Second-person singular and plural and first- and third-person plural past tense of 'be'.",
                        definition_lang: "en",
                        example: "They were waiting outside.",
                        pos: "Verb",
                        sub_pos: "Past tense of be",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/wɜːr/", region: "US/UK" },
                    { ipa: "/wər/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "đã là, đã ở (quá khứ số nhiều)" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" },
                    { related_word: "was", relation_type: "Quá khứ số ít" }
                ]
            }
        ]
    },

    "been": {
        word: "been",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=been&lang=en",
                meanings: [
                    {
                        definition: "Đã từng là, đã ở (dạng quá khứ phân từ - Past Participle / V3 của động từ to be, dùng trong các thì hoàn thành và thể bị động).",
                        definition_lang: "vi",
                        example: "I have been to Paris twice. / The car has been repaired.",
                        pos: "Động từ",
                        sub_pos: "Phân từ hai (Past Participle - V3)",
                        source: "Custom",
                        links: ["be", "was", "were"]
                    },
                    {
                        definition: "Past participle of 'be' (used in perfect tenses and passive voice).",
                        definition_lang: "en",
                        example: "How long have you been waiting?",
                        pos: "Verb",
                        sub_pos: "Past participle of be",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/biːn/", region: "UK" },
                    { ipa: "/bɪn/", region: "US" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "đã từng, đã là (V3)" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" }
                ]
            }
        ]
    },

    "being": {
        word: "being",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=being&lang=en",
                meanings: [
                    {
                        definition: "Đang là, đang ở (dạng phân từ hiện tại / V-ing hoặc danh động từ của động từ to be).",
                        definition_lang: "vi",
                        example: "Why are you being so rude? / The house is being built.",
                        pos: "Động từ",
                        sub_pos: "Hiện tại phân từ (Present Participle / V-ing)",
                        source: "Custom",
                        links: ["be"]
                    },
                    {
                        definition: "Sinh vật, con người, sự tồn tại (thực thể có tri giác).",
                        definition_lang: "vi",
                        example: "Every human being deserves respect. / Living beings.",
                        pos: "Danh từ",
                        sub_pos: "Danh từ đếm được",
                        source: "Custom",
                        links: ["human", "life"]
                    },
                    {
                        definition: "Present participle of 'be'; also a living creature or person.",
                        definition_lang: "en",
                        example: "Human being / Being polite is important.",
                        pos: "Verb / Noun",
                        sub_pos: "V-ing / Creature",
                        source: "Custom",
                        links: ["be"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ˈbiːɪŋ/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "đang là / sinh vật, con người" }
                ],
                relations: [
                    { related_word: "be", relation_type: "Gốc từ" }
                ]
            }
        ]
    },

    "pm": {
        word: "pm",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=pm&lang=en",
                meanings: [
                    {
                        definition: "Giờ buổi chiều và tối (từ 12:00 trưa đến 23:59 đêm). Viết tắt của cụm từ tiếng Latin 'post meridiem' (sau buổi trưa). Thường viết là: pm, p.m., PM hoặc P.M.",
                        definition_lang: "vi",
                        example: "The movie starts at 7:30 pm. / See you at 2 pm.",
                        pos: "Phó từ / Viết tắt",
                        sub_pos: "Chỉ thời gian (Time)",
                        source: "Custom",
                        links: ["am", "time", "clock"]
                    },
                    {
                        definition: "Thủ tướng (viết tắt của Prime Minister).",
                        definition_lang: "vi",
                        example: "The PM addressed the parliament today.",
                        pos: "Danh từ / Viết tắt",
                        sub_pos: "Chức vụ",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "Tin nhắn riêng (viết tắt của Private Message trong tin nhắn trực tuyến).",
                        definition_lang: "vi",
                        example: "Send me a PM if you have any questions.",
                        pos: "Danh từ / Động từ",
                        sub_pos: "Internet slang",
                        source: "Custom",
                        links: ["dm"]
                    },
                    {
                        definition: "Post meridiem: afternoon and evening (from noon until midnight).",
                        definition_lang: "en",
                        example: "We will meet at 6 pm.",
                        pos: "Adverb",
                        sub_pos: "Time expression",
                        source: "Custom",
                        links: ["am"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ˌpiː ˈem/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "giờ chiều/tối (sau 12h trưa) / Thủ tướng" }
                ],
                relations: [
                    { related_word: "am", relation_type: "Đối lập (giờ sáng)" }
                ]
            }
        ]
    },

    "a.m.": {
        word: "a.m.",
        aliasTo: "am",
        note: "Dạng viết có dấu chấm của 'am' (ante meridiem - giờ buổi sáng)."
    },

    "p.m.": {
        word: "p.m.",
        aliasTo: "pm",
        note: "Dạng viết có dấu chấm của 'pm' (post meridiem - giờ buổi chiều và tối)."
    },

    // 0.4. Trợ động từ & Động từ khiếm khuyết (does, can, could, will, would, should)
    "does": {
        word: "does",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=does&lang=en",
                meanings: [
                    {
                        definition: "Làm, thực hiện (dạng chia thì hiện tại đơn của động từ 'do', dùng cho chủ ngữ ngôi thứ ba số ít: he, she, it hoặc danh từ số ít).",
                        definition_lang: "vi",
                        example: "He does his homework every evening. / What does she do?",
                        pos: "Động từ",
                        sub_pos: "Động từ chính (Ngôi thứ 3 số ít)",
                        source: "Custom",
                        links: ["do", "did", "done"]
                    },
                    {
                        definition: "Trợ động từ dùng để tạo câu hỏi và câu phủ định (doesn't) ở thì hiện tại đơn cho ngôi thứ ba số ít; hoặc dùng để nhấn mạnh hành động.",
                        definition_lang: "vi",
                        example: "Does he speak English? / She doesn't like tea. / He does love you!",
                        pos: "Trợ động từ",
                        sub_pos: "Auxiliary Verb",
                        source: "Custom",
                        links: ["do", "doesn't"]
                    },
                    {
                        definition: "Third-person singular present tense of 'do'.",
                        definition_lang: "en",
                        example: "She does all the cooking.",
                        pos: "Verb",
                        sub_pos: "Auxiliary / Main verb",
                        source: "Custom",
                        links: ["do"]
                    }
                ],
                pronunciations: [
                    { ipa: "/dʌz/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "làm, thực hiện (ngôi thứ 3 số ít)" }
                ],
                relations: [
                    { related_word: "do", relation_type: "Gốc từ" },
                    { related_word: "did", relation_type: "Quá khứ" },
                    { related_word: "done", relation_type: "Phân từ hai" }
                ]
            }
        ]
    },

    "can": {
        word: "can",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=can&lang=en",
                meanings: [
                    {
                        definition: "Có thể, biết làm gì (động từ khiếm khuyết diễn tả khả năng, năng lực, sự cho phép hoặc lời yêu cầu lịch sự).",
                        definition_lang: "vi",
                        example: "I can swim. / Can you help me? / You can sit here.",
                        pos: "Động từ",
                        sub_pos: "Động từ khiếm khuyết (Modal Verb)",
                        source: "Custom",
                        links: ["could", "can't", "be able to"]
                    },
                    {
                        definition: "Cái lon, hộp thiếc, bình kim loại (dùng đựng đồ ăn, nước ngọt).",
                        definition_lang: "vi",
                        example: "A can of soda / a can of tuna.",
                        pos: "Danh từ",
                        sub_pos: "Đồ vật / Vật chứa",
                        source: "Custom",
                        links: ["tin", "bottle"]
                    },
                    {
                        definition: "Đóng hộp (bảo quản thức ăn trong hộp thiếc).",
                        definition_lang: "vi",
                        example: "Canned fruit.",
                        pos: "Động từ",
                        sub_pos: "Ngoại động từ",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "Be able to; also a metal container for food or drink.",
                        definition_lang: "en",
                        example: "She can play the piano.",
                        pos: "Modal verb / Noun",
                        sub_pos: "Ability / Container",
                        source: "Custom",
                        links: ["could"]
                    }
                ],
                pronunciations: [
                    { ipa: "/kæn/", region: "US/UK (nhấn mạnh)" },
                    { ipa: "/kən/", region: "US/UK (dạng yếu)" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "có thể / cái lon" }
                ],
                relations: [
                    { related_word: "could", relation_type: "Quá khứ" },
                    { related_word: "can't", relation_type: "Phủ định" }
                ]
            }
        ]
    },

    "could": {
        word: "could",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=could&lang=en",
                meanings: [
                    {
                        definition: "Đã có thể (thì quá khứ của 'can'); hoặc dùng để diễn tả khả năng trong tương lai/hiện tại, và lời yêu cầu rất lịch sự.",
                        definition_lang: "vi",
                        example: "When I was young, I could run fast. / Could you please open the door? / It could rain tomorrow.",
                        pos: "Động từ",
                        sub_pos: "Động từ khiếm khuyết (Modal Verb)",
                        source: "Custom",
                        links: ["can", "couldn't"]
                    },
                    {
                        definition: "Used as the past tense of 'can', to indicate possibility, or to make polite requests.",
                        definition_lang: "en",
                        example: "Could you help me with this?",
                        pos: "Modal verb",
                        sub_pos: "Past of can / Politeness",
                        source: "Custom",
                        links: ["can"]
                    }
                ],
                pronunciations: [
                    { ipa: "/kʊd/", region: "US/UK" },
                    { ipa: "/kəd/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "đã có thể, có thể (lịch sự)" }
                ],
                relations: [
                    { related_word: "can", relation_type: "Gốc từ" },
                    { related_word: "couldn't", relation_type: "Phủ định" }
                ]
            }
        ]
    },

    "will": {
        word: "will",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=will&lang=en",
                meanings: [
                    {
                        definition: "Sẽ (trợ động từ khiếm khuyết dùng để diễn tả hành động trong tương lai, sự quyết tâm, lời hứa hoặc đề nghị).",
                        definition_lang: "vi",
                        example: "I will call you tomorrow. / Will you marry me? / It will be fine.",
                        pos: "Động từ",
                        sub_pos: "Trợ động từ tương lai (Modal Auxiliary Verb)",
                        source: "Custom",
                        links: ["would", "won't"]
                    },
                    {
                        definition: "Ý chí, nghị lực, ý định, nguyện vọng.",
                        definition_lang: "vi",
                        example: "A strong will to succeed. / Where there's a will, there's a way.",
                        pos: "Danh từ",
                        sub_pos: "Danh từ trừu tượng",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "Di chúc (văn bản pháp lý ghi lại ý nguyện phân chia tài sản sau khi mất).",
                        definition_lang: "vi",
                        example: "He left all his money to charity in his will.",
                        pos: "Danh từ",
                        sub_pos: "Pháp lý",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "Expressing the future tense, determination, or willingness; also a legal document or desire.",
                        definition_lang: "en",
                        example: "They will arrive soon.",
                        pos: "Modal verb / Noun",
                        sub_pos: "Future / Desire",
                        source: "Custom",
                        links: ["would"]
                    }
                ],
                pronunciations: [
                    { ipa: "/wɪl/", region: "US/UK" },
                    { ipa: "/wəl/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "sẽ / ý chí, di chúc" }
                ],
                relations: [
                    { related_word: "would", relation_type: "Quá khứ" },
                    { related_word: "won't", relation_type: "Phủ định" }
                ]
            }
        ]
    },

    "would": {
        word: "would",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=would&lang=en",
                meanings: [
                    {
                        definition: "Sẽ (dạng quá khứ của 'will' trong lời nói gián tiếp); dùng trong câu điều kiện (would do); hoặc dùng để mời mọc, đề nghị lịch sự (Would you like...?).",
                        definition_lang: "vi",
                        example: "Would you like a cup of coffee? / If I had money, I would travel around the world. / He said he would come.",
                        pos: "Động từ",
                        sub_pos: "Động từ khiếm khuyết (Modal Verb)",
                        source: "Custom",
                        links: ["will", "wouldn't"]
                    },
                    {
                        definition: "Used as the past of 'will' in reported speech, in conditional sentences, or for polite requests.",
                        definition_lang: "en",
                        example: "Would you mind closing the window?",
                        pos: "Modal verb",
                        sub_pos: "Polite request / Conditional",
                        source: "Custom",
                        links: ["will"]
                    }
                ],
                pronunciations: [
                    { ipa: "/wʊd/", region: "US/UK" },
                    { ipa: "/wəd/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "sẽ (quá khứ/giả định), xin mời (lịch sự)" }
                ],
                relations: [
                    { related_word: "will", relation_type: "Gốc từ" },
                    { related_word: "wouldn't", relation_type: "Phủ định" }
                ]
            }
        ]
    },

    "should": {
        word: "should",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=should&lang=en",
                meanings: [
                    {
                        definition: "Nên, phải (động từ khiếm khuyết dùng để đưa ra lời khuyên, ý kiến, nghĩa vụ đạo đức hoặc dự đoán điều có thể xảy ra).",
                        definition_lang: "vi",
                        example: "You should see a doctor. / We should leave early. / It should be ready by now.",
                        pos: "Động từ",
                        sub_pos: "Động từ khiếm khuyết (Modal Verb - Khuyên bảo)",
                        source: "Custom",
                        links: ["ought to", "must", "shouldn't"]
                    },
                    {
                        definition: "Used to give advice, make recommendations, or indicate obligation.",
                        definition_lang: "en",
                        example: "You should exercise more often.",
                        pos: "Modal verb",
                        sub_pos: "Advice / Obligation",
                        source: "Custom",
                        links: ["ought to"]
                    }
                ],
                pronunciations: [
                    { ipa: "/ʃʊd/", region: "US/UK" },
                    { ipa: "/ʃəd/", region: "Dạng yếu" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "nên, phải" }
                ],
                relations: [
                    { related_word: "shouldn't", relation_type: "Phủ định" },
                    { related_word: "ought to", relation_type: "Đồng nghĩa" }
                ]
            }
        ]
    },

    // 0.5. Đại từ cốt lõi (who, mine)
    "who": {
        word: "who",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=who&lang=en",
                meanings: [
                    {
                        definition: "Ai, người nào (đại từ nghi vấn dùng để hỏi danh tính của người).",
                        definition_lang: "vi",
                        example: "Who is that man? / Who told you that?",
                        pos: "Đại từ",
                        sub_pos: "Đại từ nghi vấn (Interrogative Pronoun)",
                        source: "Custom",
                        links: ["whom", "whose"]
                    },
                    {
                        definition: "Người mà, kẻ mà (đại từ quan hệ dùng để thay thế cho danh từ chỉ người đứng trước nó).",
                        definition_lang: "vi",
                        example: "The person who called you is my brother.",
                        pos: "Đại từ",
                        sub_pos: "Đại từ quan hệ (Relative Pronoun)",
                        source: "Custom",
                        links: ["whom", "which"]
                    },
                    {
                        definition: "Tổ chức Y tế Thế giới (viết tắt của World Health Organization, viết hoa là WHO).",
                        definition_lang: "vi",
                        example: "A report from the WHO.",
                        pos: "Danh từ / Viết tắt",
                        sub_pos: "Tổ chức quốc tế",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "What or which person or people (used to ask questions or introduce a relative clause).",
                        definition_lang: "en",
                        example: "Who wants some ice cream?",
                        pos: "Pronoun",
                        sub_pos: "Interrogative / Relative",
                        source: "Custom",
                        links: ["whom"]
                    }
                ],
                pronunciations: [
                    { ipa: "/huː/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "ai, người nào" }
                ],
                relations: [
                    { related_word: "whom", relation_type: "Dạng tân ngữ" },
                    { related_word: "whose", relation_type: "Dạng sở hữu" }
                ]
            }
        ]
    },

    "mine": {
        word: "mine",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=mine&lang=en",
                meanings: [
                    {
                        definition: "Của tôi (đại từ sở hữu dùng độc lập, thay thế cho cụm 'my + danh từ').",
                        definition_lang: "vi",
                        example: "This book is mine. / A friend of mine.",
                        pos: "Đại từ",
                        sub_pos: "Đại từ sở hữu (Possessive Pronoun)",
                        source: "Custom",
                        links: ["my", "me", "I"]
                    },
                    {
                        definition: "Mỏ (nơi khai thác than, vàng, quặng kim loại dưới lòng đất).",
                        definition_lang: "vi",
                        example: "A coal mine / gold mine.",
                        pos: "Danh từ",
                        sub_pos: "Khai khoáng",
                        source: "Custom",
                        links: ["mining", "miner"]
                    },
                    {
                        definition: "Quả mìn, địa lôi (vũ khí nổ đặt dưới đất hoặc dưới nước).",
                        definition_lang: "vi",
                        example: "A land mine.",
                        pos: "Danh từ",
                        sub_pos: "Quân sự",
                        source: "Custom",
                        links: []
                    },
                    {
                        definition: "The one or ones belonging to me; also an excavation in the earth for extracting minerals.",
                        definition_lang: "en",
                        example: "That pen is mine.",
                        pos: "Pronoun / Noun",
                        sub_pos: "Possessive / Excavation",
                        source: "Custom",
                        links: ["my"]
                    }
                ],
                pronunciations: [
                    { ipa: "/maɪn/", region: "US/UK" }
                ],
                translations: [
                    { lang_code: "vi", lang_name: "Tiếng Việt", translation: "của tôi / mỏ khoáng sản" }
                ],
                relations: [
                    { related_word: "my", relation_type: "Tính từ sở hữu" },
                    { related_word: "I", relation_type: "Gốc từ" }
                ]
            }
        ]
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
