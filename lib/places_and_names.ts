import { LanguageResult } from './dictionary';

export interface PlaceOrNameEntry {
    name: string;
    aliases: string[]; // các tên gọi khác hoặc biến thể không dấu, ví dụ: ["da nang", "danang", "tp da nang"]
    category: 'vietnam_province' | 'world_country' | 'world_capital' | 'river' | 'lake' | 'mountain' | 'landmark' | 'proper_name';
    results: LanguageResult[];
}

/**
 * Bảng ánh xạ không dấu sang có dấu của tất cả 63 tỉnh thành & địa danh du lịch nổi tiếng Việt Nam
 */
export const VN_UNACCENTED_PLACES: Record<string, string> = {
    // 63 tỉnh thành & thành phố trực thuộc TW
    "ha noi": "hà nội",
    "hanoi": "hà nội",
    "tp ha noi": "hà nội",
    "sai gon": "sài gòn",
    "saigon": "sài gòn",
    "tp ho chi minh": "hồ chí minh",
    "ho chi minh": "hồ chí minh",
    "tphcm": "hồ chí minh",
    "hcm": "hồ chí minh",
    "da nang": "đà nẵng",
    "danang": "đà nẵng",
    "hai phong": "hải phòng",
    "haiphong": "hải phòng",
    "can tho": "cần thơ",
    "cantho": "cần thơ",
    "an giang": "an giang",
    "ba ria": "bà rịa",
    "vung tau": "vũng tàu",
    "ba ria - vung tau": "bà rịa - vũng tàu",
    "ba ria vung tau": "bà rịa - vũng tàu",
    "bac giang": "bắc giang",
    "bac kan": "bắc kạn",
    "bac lieu": "bạc liêu",
    "bac ninh": "bắc ninh",
    "ben tre": "bến tre",
    "binh dinh": "bình định",
    "binh duong": "bình dương",
    "binh phuoc": "bình phước",
    "binh thuan": "bình thuận",
    "ca mau": "cà mau",
    "cao bang": "cao bằng",
    "dak lak": "đắk lắk",
    "dak nong": "đắk nông",
    "dien bien": "điện biên",
    "dien bien phu": "điện biên phủ",
    "dong nai": "đồng nai",
    "dong thap": "đồng tháp",
    "gia lai": "gia lai",
    "ha giang": "hà giang",
    "ha nam": "hà nam",
    "ha tinh": "hà tĩnh",
    "hai duong": "hải dương",
    "hau giang": "hậu giang",
    "hoa binh": "hòa bình",
    "hung yen": "hưng yên",
    "khanh hoa": "khánh hòa",
    "nha trang": "nha trang",
    "kien giang": "kiên giang",
    "phu quoc": "phú quốc",
    "kon tum": "kon tum",
    "lai chau": "lai châu",
    "lam dong": "lâm đồng",
    "da lat": "đà lạt",
    "dalat": "đà lạt",
    "lang son": "lạng sơn",
    "lao cai": "lào cai",
    "sa pa": "sa pa",
    "sapa": "sa pa",
    "long an": "long an",
    "nam dinh": "nam định",
    "nghe an": "nghệ an",
    "vinh": "vinh",
    "ninh binh": "ninh bình",
    "ninh thuan": "ninh thuận",
    "phan rang": "phan rang",
    "phu tho": "phú thọ",
    "phu yen": "phú yên",
    "tuy hoa": "tuy hòa",
    "quang binh": "quảng bình",
    "dong hoi": "đồng hới",
    "quang nam": "quảng nam",
    "hoi an": "hội an",
    "quang ngai": "quảng ngãi",
    "quang ninh": "quảng ninh",
    "ha long": "hạ long",
    "quang tri": "quảng trị",
    "soc trang": "sóc trăng",
    "son la": "sơn la",
    "tay ninh": "tây ninh",
    "thai binh": "thái bình",
    "thai nguyen": "thái nguyên",
    "thanh hoa": "thanh hóa",
    "thua thien hue": "thừa thiên huế",
    "hue": "huế",
    "tien giang": "tiền giang",
    "my tho": "mỹ tho",
    "tra vinh": "trà vinh",
    "tuyen quang": "tuyên quang",
    "vinh long": "vĩnh long",
    "vinh phuc": "vĩnh phúc",
    "yen bai": "yên bái",
    "buon ma thuot": "buôn ma thuột",
    "con dao": "côn đảo",

    // Sông ngòi Việt Nam
    "song hong": "sông hồng",
    "song da": "sông đà",
    "song huong": "sông hương",
    "song sai gon": "sông sài gòn",
    "song dong nai": "sông đồng nai",
    "song mekong": "sông mê kông",
    "song cuu long": "sông cửu long",
    "song lam": "sông lam",
    "song ma": "sông mã",
    "song bach dang": "sông bạch đằng",
    "song gianh": "sông gianh",
    "song thu bon": "sông thu bồn",

    // Hồ nước, đầm phá Việt Nam
    "ho guom": "hồ gươm",
    "ho hoan kiem": "hồ hoàn kiếm",
    "ho tay": "hồ tây",
    "ho ba be": "hồ ba bể",
    "ho tri an": "hồ trị an",
    "ho dau tieng": "hồ dầu tiếng",
    "ho xuan huong": "hồ xuân hương",
    "ho tuyen lam": "hồ tuyền lâm",
    "pha tam giang": "phá tam giang",

    // Danh lam thắng cảnh, di tích & kỳ quan Việt Nam
    "vinh ha long": "vịnh hạ long",
    "dong phong nha": "động phong nha",
    "hang son doong": "hang sơn đoòng",
    "chua mot cot": "chùa một cột",
    "chua bai dinh": "chùa bái đính",
    "chua huong": "chùa hương",
    "chua tam chuc": "chùa tam chúc",
    "pho co hoi an": "phố cổ hội an",
    "co do hue": "cố đô huế",
    "nha tho duc ba": "nhà thờ đức bà",
    "ben nha rong": "bến nhà rồng",
    "dinh doc lap": "dinh độc lập",
    "thanh dia my son": "thánh địa mỹ sơn",
    "quan the danh thang trang an": "tràng an",
    "trang an": "tràng an",

    // Núi non & đèo nổi tiếng
    "fansipan": "fansipan",
    "phan xi pang": "fansipan",
    "deo hai van": "đèo hải vân",
    "nui ba den": "núi bà đen",
    "ngu hanh son": "ngũ hành sơn",
    "tam dao": "tam đảo",
    "ba vi": "ba vì"
};

/**
 * Danh mục tri thức tra cứu nhanh cho Địa danh, Quốc gia, Thủ đô, Sông hồ, Núi non và Nhân vật
 */
export const PLACES_AND_NAMES_DB: Record<string, PlaceOrNameEntry> = {
    // ==========================================
    // 1. CÁC QUỐC GIA TRÊN THẾ GIỚI (COUNTRIES)
    // ==========================================
    "italy": {
        name: "Italy",
        aliases: ["italia", "y", "ý", "nuoc y", "nước ý"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Italy&lang=en",
                meanings: [
                    {
                        definition: "Ý (Cộng hòa Ý - Italia), quốc gia nằm ở Nam Âu, có hình dạng chiếc ủng vươn ra biển Địa Trung Hải. Thủ đô là Roma.",
                        definition_lang: "vi",
                        example: "Rome is the capital of Italy.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Roma", "Europe"]
                    },
                    {
                        definition: "A country in southern Europe, comprising the boot-shaped Italian Peninsula and several islands. Capital: Rome.",
                        definition_lang: "en",
                        example: "Italy is famous for its art, architecture, and food.",
                        pos: "Proper noun",
                        sub_pos: "Country",
                        source: "Geographic DB",
                        links: ["Rome", "Europe"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈɪt.əl.i/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Ý, Nước Ý, I-ta-li-a" }],
                relations: [{ related_word: "Rome", relation_type: "Thủ đô" }]
            }
        ]
    },
    "russia": {
        name: "Russia",
        aliases: ["nga", "nuoc nga", "nước nga", "lien bang nga", "liên bang nga"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Russia&lang=en",
                meanings: [
                    {
                        definition: "Nga (Liên bang Nga), quốc gia có diện tích lớn nhất thế giới, trải dài trên khắp Đông Âu và Bắc Á. Thủ đô là Mát-xcơ-va (Moscow).",
                        definition_lang: "vi",
                        example: "Moscow is the capital city of Russia.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Moscow", "Eurasia"]
                    },
                    {
                        definition: "The largest country in the world by area, extending across Eastern Europe and Northern Asia. Capital: Moscow.",
                        definition_lang: "en",
                        example: "Russia spans eleven time zones.",
                        pos: "Proper noun",
                        sub_pos: "Country",
                        source: "Geographic DB",
                        links: ["Moscow", "Russian Federation"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈrʌʃ.ə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Nga, Nước Nga, Liên bang Nga" }],
                relations: [{ related_word: "Moscow", relation_type: "Thủ đô" }]
            }
        ]
    },
    "china": {
        name: "China",
        aliases: ["trung quoc", "trung quốc", "nuoc trung quoc"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=China&lang=en",
                meanings: [
                    {
                        definition: "Trung Quốc (Cộng hòa Nhân dân Trung Hoa), quốc gia ở khu vực Đông Á, đông dân hàng đầu thế giới với nền văn minh lâu đời. Thủ đô là Bắc Kinh (Beijing).",
                        definition_lang: "vi",
                        example: "Beijing is the capital of China.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Beijing", "Asia"]
                    },
                    {
                        definition: "A country in East Asia, officially the People's Republic of China, the world's most populous or second-most populous nation. Capital: Beijing.",
                        definition_lang: "en",
                        example: "China has a rich history spanning millennia.",
                        pos: "Proper noun",
                        sub_pos: "Country",
                        source: "Geographic DB",
                        links: ["Beijing", "Asia"]
                    },
                    {
                        definition: "Đồ sứ, đồ gốm tráng men tinh xảo (danh từ chung trong tiếng Anh).",
                        definition_lang: "vi",
                        example: "Fine bone china.",
                        pos: "Danh từ",
                        sub_pos: "Vật dụng",
                        source: "Geographic DB",
                        links: []
                    }
                ],
                pronunciations: [{ ipa: "/ˈtʃaɪ.nə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Trung Quốc, Nước Trung Hoa" }],
                relations: [{ related_word: "Beijing", relation_type: "Thủ đô" }]
            }
        ]
    },
    "korea": {
        name: "Korea",
        aliases: ["han quoc", "hàn quốc", "trieu tien", "triều tiên", "south korea", "north korea"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Korea&lang=en",
                meanings: [
                    {
                        definition: "Bán đảo Triều Tiên (Hàn Quốc / Triều Tiên), khu vực tại Đông Á gồm Hàn Quốc (Đại Hàn Dân Quốc, thủ đô Seoul) và Triều Tiên (Cộng hòa Dân chủ Nhân dân Triều Tiên, thủ đô Bình Nhưỡng).",
                        definition_lang: "vi",
                        example: "Seoul is the capital of South Korea.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Seoul", "Pyongyang"]
                    },
                    {
                        definition: "A peninsula in East Asia divided since 1945 into North Korea and South Korea.",
                        definition_lang: "en",
                        example: "South Korea is known for technological innovation.",
                        pos: "Proper noun",
                        sub_pos: "Country / Peninsula",
                        source: "Geographic DB",
                        links: ["Seoul", "South Korea"]
                    }
                ],
                pronunciations: [{ ipa: "/kəˈriː.ə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Hàn Quốc, Triều Tiên" }],
                relations: [{ related_word: "Seoul", relation_type: "Thủ đô" }]
            }
        ]
    },
    "japan": {
        name: "Japan",
        aliases: ["nhat ban", "nhật bản", "xu so hoa anh dao", "xứ sở hoa anh đào"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Japan&lang=en",
                meanings: [
                    {
                        definition: "Nhật Bản, quốc gia hải đảo ở Đông Á nằm trên Thái Bình Dương, nổi tiếng với hoa anh đào, núi Phú Sĩ và công nghệ tiên tiến. Thủ đô là Tokyo.",
                        definition_lang: "vi",
                        example: "Tokyo is the bustling capital of Japan.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Tokyo", "Mount Fuji"]
                    }
                ],
                pronunciations: [{ ipa: "/dʒəˈpæn/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Nhật Bản" }],
                relations: [{ related_word: "Tokyo", relation_type: "Thủ đô" }]
            }
        ]
    },
    "france": {
        name: "France",
        aliases: ["phap", "pháp", "nuoc phap", "nước pháp"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=France&lang=en",
                meanings: [
                    {
                        definition: "Pháp (Cộng hòa Pháp), quốc gia tại Tây Âu với bề dày lịch sử, văn hóa nghệ thuật và ẩm thực hàng đầu thế giới. Thủ đô là Paris.",
                        definition_lang: "vi",
                        example: "Paris is the capital of France.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Paris", "Eiffel Tower"]
                    }
                ],
                pronunciations: [{ ipa: "/fræns/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Pháp, Nước Pháp" }],
                relations: [{ related_word: "Paris", relation_type: "Thủ đô" }]
            }
        ]
    },
    "germany": {
        name: "Germany",
        aliases: ["duc", "đức", "nuoc duc", "nước đức"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Germany&lang=en",
                meanings: [
                    {
                        definition: "Đức (Cộng hòa Liên bang Đức), quốc gia ở Trung Âu, là nền kinh tế lớn nhất châu Âu. Thủ đô là Berlin.",
                        definition_lang: "vi",
                        example: "Berlin is the capital of Germany.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Berlin"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈdʒɜː.mə.ni/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Đức, Nước Đức" }],
                relations: [{ related_word: "Berlin", relation_type: "Thủ đô" }]
            }
        ]
    },
    "england": {
        name: "England",
        aliases: ["anh", "nuoc anh", "nước anh", "united kingdom", "uk"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=England&lang=en",
                meanings: [
                    {
                        definition: "Nước Anh, một quốc gia thuộc Vương quốc Liên hiệp Anh và Bắc Ireland (UK) ở Tây Bắc Âu. Thủ đô là London.",
                        definition_lang: "vi",
                        example: "London is the capital of England.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["London", "United Kingdom"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈɪŋ.ɡlənd/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Nước Anh, Xứ sở sương mù" }],
                relations: [{ related_word: "London", relation_type: "Thủ đô" }]
            }
        ]
    },
    "america": {
        name: "America",
        aliases: ["usa", "hoa ky", "hoa kỳ", "my", "mỹ", "united states"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=America&lang=en",
                meanings: [
                    {
                        definition: "Nước Mỹ (Hợp chúng quốc Hoa Kỳ - USA) hoặc Châu Mỹ (Bắc Mỹ và Nam Mỹ). Thủ đô của Hoa Kỳ là Washington, D.C.",
                        definition_lang: "vi",
                        example: "Washington, D.C. is the capital of America.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Washington", "USA"]
                    }
                ],
                pronunciations: [{ ipa: "/əˈmer.ɪ.kə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Nước Mỹ, Hoa Kỳ, Châu Mỹ" }],
                relations: [{ related_word: "Washington", relation_type: "Thủ đô" }]
            }
        ]
    },
    "australia": {
        name: "Australia",
        aliases: ["uc", "úc", "nuoc uc", "nước úc"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Australia&lang=en",
                meanings: [
                    {
                        definition: "Úc (Khối thịnh vượng chung Úc), quốc gia bao gồm đại lục châu Úc, đảo Tasmania và nhiều đảo nhỏ. Thủ đô là Canberra.",
                        definition_lang: "vi",
                        example: "Canberra is the federal capital of Australia.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Canberra", "Sydney"]
                    }
                ],
                pronunciations: [{ ipa: "/ɒsˈtreɪ.li.ə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Nước Úc, Ô-xtơ-rây-li-a" }],
                relations: [{ related_word: "Canberra", relation_type: "Thủ đô" }]
            }
        ]
    },
    "canada": {
        name: "Canada",
        aliases: ["ca na da"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Canada&lang=en",
                meanings: [
                    {
                        definition: "Canada, quốc gia nằm ở phần phía bắc của Bắc Mỹ, có diện tích lớn thứ hai thế giới. Thủ đô là Ottawa.",
                        definition_lang: "vi",
                        example: "Ottawa is the capital of Canada.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Ottawa", "North America"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈkæn.ə.də/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Canada, Ca-na-đa" }],
                relations: [{ related_word: "Ottawa", relation_type: "Thủ đô" }]
            }
        ]
    },
    "brazil": {
        name: "Brazil",
        aliases: ["brasil", "brayxin", "bra-xin"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Brazil&lang=en",
                meanings: [
                    {
                        definition: "Brazil (Cộng hòa Liên bang Brasil), quốc gia lớn nhất ở Nam Mỹ, nổi tiếng với rừng nhiệt đới Amazon và bóng đá. Thủ đô là Brasília.",
                        definition_lang: "vi",
                        example: "Brasília is the federal capital of Brazil.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["Brasilia", "Amazon"]
                    }
                ],
                pronunciations: [{ ipa: "/brəˈzɪl/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Bra-xin, Nước Brazil" }],
                relations: [{ related_word: "Brasilia", relation_type: "Thủ đô" }]
            }
        ]
    },
    "india": {
        name: "India",
        aliases: ["an do", "ấn độ", "nuoc an do"],
        category: "world_country",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=India&lang=en",
                meanings: [
                    {
                        definition: "Ấn Độ (Cộng hòa Ấn Độ), quốc gia nằm ở Nam Á, là quốc gia đông dân nhất thế giới. Thủ đô là New Delhi.",
                        definition_lang: "vi",
                        example: "New Delhi is the capital of India.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Quốc gia",
                        source: "Geographic DB",
                        links: ["New Delhi"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈɪn.di.ə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Ấn Độ" }],
                relations: [{ related_word: "New Delhi", relation_type: "Thủ đô" }]
            }
        ]
    },

    // ==========================================
    // 2. THỦ ĐÔ VÀ THÀNH PHỐ NỔI TIẾNG (CAPITALS)
    // ==========================================
    "beijing": {
        name: "Beijing",
        aliases: ["bac kinh", "bắc kinh", "peking"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Beijing&lang=en",
                meanings: [
                    {
                        definition: "Bắc Kinh, thủ đô của Cộng hòa Nhân dân Trung Hoa, là trung tâm chính trị, văn hóa của Trung Quốc.",
                        definition_lang: "vi",
                        example: "Beijing hosted the 2008 Olympic Games.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["China", "Forbidden City"]
                    }
                ],
                pronunciations: [{ ipa: "/beɪˈdʒɪŋ/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Bắc Kinh" }],
                relations: [{ related_word: "China", relation_type: "Quốc gia" }]
            }
        ]
    },
    "washington": {
        name: "Washington",
        aliases: ["washington dc", "oasinhton"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Washington&lang=en",
                meanings: [
                    {
                        definition: "Washington, D.C., thủ đô của Hoa Kỳ, nơi đặt Nhà Trắng và Quốc hội Mỹ. Đồng thời là tên một tiểu bang ở bờ Tây nước Mỹ.",
                        definition_lang: "vi",
                        example: "The White House is located in Washington, D.C.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["USA", "White House"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈwɒʃ.ɪŋ.tən/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Oa-sinh-tơn" }],
                relations: [{ related_word: "USA", relation_type: "Quốc gia" }]
            }
        ]
    },
    "london": {
        name: "London",
        aliases: ["luan don", "luân đôn"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=London&lang=en",
                meanings: [
                    {
                        definition: "Luân Đôn, thủ đô và thành phố lớn nhất của Vương quốc Anh (UK), nằm bên bờ sông Thames.",
                        definition_lang: "vi",
                        example: "Big Ben is a landmark in London.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["England", "Big Ben", "River Thames"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈlʌn.dən/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Luân Đôn" }],
                relations: [{ related_word: "England", relation_type: "Quốc gia" }]
            }
        ]
    },
    "tokyo": {
        name: "Tokyo",
        aliases: ["dong kinh", "đông kinh"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Tokyo&lang=en",
                meanings: [
                    {
                        definition: "Tokyo (Đông Kinh), thủ đô của Nhật Bản, siêu đô thị hiện đại và sầm uất bậc nhất thế giới.",
                        definition_lang: "vi",
                        example: "Tokyo is one of the world's major economic centers.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["Japan"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈtoʊ.ki.oʊ/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Tô-ki-ô, Đông Kinh" }],
                relations: [{ related_word: "Japan", relation_type: "Quốc gia" }]
            }
        ]
    },
    "paris": {
        name: "Paris",
        aliases: ["kinh do anh sang", "kinh đô ánh sáng"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Paris&lang=en",
                meanings: [
                    {
                        definition: "Paris, thủ đô nước Pháp, được mệnh danh là 'Kinh đô Ánh sáng' và 'Thành phố Tình yêu', nổi tiếng với tháp Eiffel và bảo tàng Louvre.",
                        definition_lang: "vi",
                        example: "The Eiffel Tower stands in the heart of Paris.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["France", "Eiffel Tower", "Louvre"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈpær.ɪs/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Pa-ri" }],
                relations: [{ related_word: "France", relation_type: "Quốc gia" }]
            }
        ]
    },
    "moscow": {
        name: "Moscow",
        aliases: ["mat-xco-va", "matxcova", "mát-xcơ-va"],
        category: "world_capital",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Moscow&lang=en",
                meanings: [
                    {
                        definition: "Mát-xcơ-va (Moscow), thủ đô của Nga, nổi tiếng với Điện Kremlin và Quảng trường Đỏ.",
                        definition_lang: "vi",
                        example: "The Kremlin is located in Moscow.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Thủ đô",
                        source: "Geographic DB",
                        links: ["Russia", "Kremlin", "Red Square"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈmɒs.koʊ/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Mát-xcơ-va" }],
                relations: [{ related_word: "Russia", relation_type: "Quốc gia" }]
            }
        ]
    },

    // ==========================================
    // 3. SÔNG HỒ, NÚI NON & DANH THẮNG THẾ GIỚI
    // ==========================================
    "nile": {
        name: "Nile",
        aliases: ["song nin", "sông nin", "river nile"],
        category: "river",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Nile&lang=en",
                meanings: [
                    {
                        definition: "Sông Nin (Nile River), dòng sông chảy theo hướng bắc ở Đông Bắc châu Phi, được xem là dòng sông dài nhất thế giới, cái nôi của nền văn minh Ai Cập cổ đại.",
                        definition_lang: "vi",
                        example: "The Nile is vital to Egyptian agriculture and civilization.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Sông ngòi",
                        source: "Geographic DB",
                        links: ["Egypt", "Africa"]
                    },
                    {
                        definition: "A major north-flowing river in northeastern Africa, generally considered the longest river in the world.",
                        definition_lang: "en",
                        example: "Ancient Egyptian civilization formed along the banks of the Nile.",
                        pos: "Proper noun",
                        sub_pos: "River",
                        source: "Geographic DB",
                        links: ["Egypt", "Africa"]
                    }
                ],
                pronunciations: [{ ipa: "/naɪl/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Sông Nin" }],
                relations: [{ related_word: "Egypt", relation_type: "Địa lý" }]
            }
        ]
    },
    "amazon": {
        name: "Amazon",
        aliases: ["song amazon", "sông a-ma-dôn", "rung amazon", "amazon river"],
        category: "river",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Amazon&lang=en",
                meanings: [
                    {
                        definition: "Sông A-ma-dôn (Amazon River), dòng sông có lưu lượng nước lớn nhất thế giới, chảy qua rừng nhiệt đới Amazon ở Nam Mỹ.",
                        definition_lang: "vi",
                        example: "The Amazon River flows across South America.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Sông ngòi",
                        source: "Geographic DB",
                        links: ["Brazil", "South America"]
                    },
                    {
                        definition: "Rừng nhiệt đới Amazon - 'lá phổi xanh của Trái Đất'.",
                        definition_lang: "vi",
                        example: "The Amazon rainforest is the largest in the world.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Sinh thái",
                        source: "Geographic DB",
                        links: ["Rainforest"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈæm.ə.zən/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Sông A-ma-dôn, Rừng Amazon" }],
                relations: [{ related_word: "Brazil", relation_type: "Địa lý" }]
            }
        ]
    },
    "mekong": {
        name: "Mekong",
        aliases: ["song mekong", "sông mê kông", "song cuu long", "sông cửu long", "mekong river"],
        category: "river",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Mekong&lang=en",
                meanings: [
                    {
                        definition: "Sông Mê Kông (tại Việt Nam gọi là Sông Cửu Long), một trong những dòng sông lớn nhất thế giới, bắt nguồn từ Tây Tạng chảy qua Trung Quốc, Myanmar, Lào, Thái Lan, Campuchia và đổ ra Biển Đông tại Việt Nam.",
                        definition_lang: "vi",
                        example: "The Mekong Delta is the primary rice-producing region in Vietnam.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Sông ngòi",
                        source: "Geographic DB",
                        links: ["Vietnam", "Mekong Delta"]
                    }
                ],
                pronunciations: [{ ipa: "/meɪˈkɒŋ/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Sông Mê Kông, Sông Cửu Long" }],
                relations: [{ related_word: "Vietnam", relation_type: "Địa lý" }]
            }
        ]
    },
    "everest": {
        name: "Everest",
        aliases: ["dinh everest", "đỉnh everest", "mount everest", "chomolungma"],
        category: "mountain",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Everest&lang=en",
                meanings: [
                    {
                        definition: "Đỉnh Everest (Chomolungma), đỉnh núi cao nhất trên Trái Đất với độ cao 8.848,86 mét so với mực nước biển, thuộc dãy Himalaya nằm ở biên giới giữa Nepal và Tây Tạng (Trung Quốc).",
                        definition_lang: "vi",
                        example: "Mount Everest is the highest mountain on Earth.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Núi non",
                        source: "Geographic DB",
                        links: ["Himalaya", "Nepal"]
                    },
                    {
                        definition: "Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas. Elevation: 8,848.86 m.",
                        definition_lang: "en",
                        example: "Climbers from around the world attempt to summit Everest.",
                        pos: "Proper noun",
                        sub_pos: "Mountain",
                        source: "Geographic DB",
                        links: ["Himalaya", "Nepal"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈev.ər.ɪst/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Đỉnh Everest, Núi Everest" }],
                relations: [{ related_word: "Himalaya", relation_type: "Dãy núi" }]
            }
        ]
    },
    "himalaya": {
        name: "Himalaya",
        aliases: ["day himalaya", "dãy himalaya", "himalayas"],
        category: "mountain",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Himalaya&lang=en",
                meanings: [
                    {
                        definition: "Dãy Himalaya (Hy Mã Lạp Sơn), dãy núi cao nhất thế giới ở châu Á, ngăn cách tiểu lục địa Ấn Độ với cao nguyên Tây Tạng.",
                        definition_lang: "vi",
                        example: "The Himalayas contain many of the world's tallest peaks.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Dãy núi",
                        source: "Geographic DB",
                        links: ["Everest", "Asia"]
                    }
                ],
                pronunciations: [{ ipa: "/ˌhɪm.əˈleɪ.ə/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Dãy Himalaya, Hy Mã Lạp Sơn" }],
                relations: [{ related_word: "Everest", relation_type: "Đỉnh núi" }]
            }
        ]
    },
    "alps": {
        name: "Alps",
        aliases: ["day an-po", "dãy an-pơ", "day alps"],
        category: "mountain",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Alps&lang=en",
                meanings: [
                    {
                        definition: "Dãy Alps (An-pơ), hệ thống núi cao và rộng lớn nhất ở châu Âu, trải dài qua Pháp, Thụy Sĩ, Ý, Áo, Đức...",
                        definition_lang: "vi",
                        example: "The Alps are popular for skiing and mountaineering.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Dãy núi",
                        source: "Geographic DB",
                        links: ["Europe", "Mont Blanc"]
                    }
                ],
                pronunciations: [{ ipa: "/ælps/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Dãy núi An-pơ" }],
                relations: [{ related_word: "Europe", relation_type: "Châu lục" }]
            }
        ]
    },

    // ==========================================
    // 4. SÔNG HỒ & DANH THẮNG VIỆT NAM
    // ==========================================
    "hồ ba bể": {
        name: "Hồ Ba Bể",
        aliases: ["ho ba be", "hồ ba bể"],
        category: "lake",
        results: [
            {
                lang_code: "vi",
                lang_name: "Tiếng Việt",
                audio: "/api/v1/tts?word=H%E1%BB%93%20Ba%20B%E1%BB%83&lang=vi",
                meanings: [
                    {
                        definition: "Hồ Ba Bể là hồ nước ngọt tự nhiên lớn nhất Việt Nam và là một trong 20 hồ nước ngọt đặc biệt của thế giới cần được bảo vệ, thuộc Vườn quốc gia Ba Bể, tỉnh Bắc Kạn.",
                        definition_lang: "vi",
                        example: "Hồ Ba Bể là thắng cảnh du lịch sinh thái nổi tiếng miền Bắc.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Sông hồ",
                        source: "Geographic DB",
                        links: ["Bắc Kạn", "Vườn quốc gia Ba Bể"]
                    }
                ],
                pronunciations: [{ ipa: "ho˨˩ ɓaː˧˧ ɓe˧˩", region: "Hà Nội" }],
                translations: [{ lang_code: "en", lang_name: "Tiếng Anh", translation: "Ba Be Lake" }],
                relations: [{ related_word: "Bắc Kạn", relation_type: "Tỉnh thành" }]
            }
        ]
    },
    "vịnh hạ long": {
        name: "Vịnh Hạ Long",
        aliases: ["vinh ha long", "ha long bay"],
        category: "landmark",
        results: [
            {
                lang_code: "vi",
                lang_name: "Tiếng Việt",
                audio: "/api/v1/tts?word=V%E1%BB%8Bnh%20H%E1%BA%A1%20Long&lang=vi",
                meanings: [
                    {
                        definition: "Vịnh Hạ Long là vịnh biển thuộc tỉnh Quảng Ninh, di sản thiên nhiên thế giới được UNESCO công nhận với hàng nghìn hòn đảo đá vôi kỳ vĩ.",
                        definition_lang: "vi",
                        example: "Vịnh Hạ Long là kỳ quan thiên nhiên của thế giới.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Danh thắng",
                        source: "Geographic DB",
                        links: ["Quảng Ninh", "UNESCO"]
                    }
                ],
                pronunciations: [{ ipa: "vïŋ˧ˀ˨ʔ haː˧˨ʔ lawŋ͡m˧˧", region: "Hà Nội" }],
                translations: [{ lang_code: "en", lang_name: "Tiếng Anh", translation: "Ha Long Bay" }],
                relations: [{ related_word: "Quảng Ninh", relation_type: "Tỉnh thành" }]
            }
        ]
    },
    "fansipan": {
        name: "Fansipan",
        aliases: ["phan xi pang", "phan-xi-păng", "dinh fansipan"],
        category: "mountain",
        results: [
            {
                lang_code: "vi",
                lang_name: "Tiếng Việt",
                audio: "/api/v1/tts?word=Fansipan&lang=vi",
                meanings: [
                    {
                        definition: "Fansipan (Phan Xi Păng) là ngọn núi cao nhất Việt Nam và toàn bán đảo Đông Dương với độ cao 3.143 mét, được mệnh danh là 'Nóc nhà Đông Dương', nằm ở dãy Hoàng Liên Sơn, tỉnh Lào Cai.",
                        definition_lang: "vi",
                        example: "Chinh phục đỉnh Fansipan tại thị xã Sa Pa.",
                        pos: "Danh từ riêng",
                        sub_pos: "Địa danh / Núi non",
                        source: "Geographic DB",
                        links: ["Lào Cai", "Sa Pa", "Hoàng Liên Sơn"]
                    }
                ],
                pronunciations: [{ ipa: "/fænsɪpæn/", region: "Quốc tế" }],
                translations: [{ lang_code: "en", lang_name: "Tiếng Anh", translation: "Mount Fansipan" }],
                relations: [{ related_word: "Lào Cai", relation_type: "Địa phương" }]
            }
        ]
    },

    // ==========================================
    // 5. TÊN NGƯỜI PHỔ BIẾN & NHÂN VẬT (PROPER NAMES)
    // ==========================================
    "mary": {
        name: "Mary",
        aliases: ["marie"],
        category: "proper_name",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Mary&lang=en",
                meanings: [
                    {
                        definition: "Mary (tên riêng nữ), một trong những tên phổ biến nhất trong các nước nói tiếng Anh, có nguồn gốc từ tiếng Do Thái (Miriam / Maria). Thường liên quan đến Đức Mẹ Maria trong Kitô giáo.",
                        definition_lang: "vi",
                        example: "Mary had a little lamb.",
                        pos: "Danh từ riêng",
                        sub_pos: "Tên người",
                        source: "Names DB",
                        links: ["Maria"]
                    },
                    {
                        definition: "A female given name of Hebrew origin, historically one of the most common feminine names in the English-speaking world.",
                        definition_lang: "en",
                        example: "Mary is studying medicine at university.",
                        pos: "Proper noun",
                        sub_pos: "Given name",
                        source: "Names DB",
                        links: []
                    }
                ],
                pronunciations: [{ ipa: "/ˈmeə.ri/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Ma-ri, Tên riêng Mary" }],
                relations: []
            }
        ]
    },
    "albert einstein": {
        name: "Albert Einstein",
        aliases: ["einstein"],
        category: "proper_name",
        results: [
            {
                lang_code: "en",
                lang_name: "Tiếng Anh",
                audio: "/api/v1/tts?word=Albert%20Einstein&lang=en",
                meanings: [
                    {
                        definition: "Albert Einstein (1879–1955), nhà vật lý lý thuyết vĩ đại người Đức, người phát triển Thuyết tương đối (hẹp và tổng quát) và công thức E = mc², đoạt giải Nobel Vật lý năm 1921.",
                        definition_lang: "vi",
                        example: "Einstein is synonymous with genius.",
                        pos: "Danh từ riêng",
                        sub_pos: "Nhân vật lịch sử / Nhà khoa học",
                        source: "Names DB",
                        links: ["Relativity", "Nobel Prize"]
                    }
                ],
                pronunciations: [{ ipa: "/ˈæl.bət ˈaɪn.staɪn/", region: "US/UK" }],
                translations: [{ lang_code: "vi", lang_name: "Tiếng Việt", translation: "Anh-xtanh, An-be Anh-xtanh" }],
                relations: [{ related_word: "Physics", relation_type: "Lĩnh vực" }]
            }
        ]
    }
};

/**
 * Tìm kiếm nhanh tên địa danh / thực thể trong danh mục Offline
 */
export function getPlaceOrName(rawQuery: string): LanguageResult[] | null {
    const clean = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!clean) return null;

    // 1. Kiểm tra trực tiếp key
    if (PLACES_AND_NAMES_DB[clean]) {
        return PLACES_AND_NAMES_DB[clean].results;
    }

    // 2. Kiểm tra trong danh sách aliases
    for (const entry of Object.values(PLACES_AND_NAMES_DB)) {
        if (entry.name.toLowerCase() === clean) {
            return entry.results;
        }
        if (entry.aliases.some(alias => alias.toLowerCase() === clean)) {
            return entry.results;
        }
    }

    return null;
}

/**
 * Lấy danh sách gợi ý cho địa danh, quốc gia, tên riêng
 */
export function getPlacesSuggestions(prefix: string, limit: number = 5): string[] {
    const clean = prefix.trim().toLowerCase();
    if (!clean) return [];

    const suggestions: string[] = [];

    // Gợi ý từ unaccented places (Hà Nội, Sài Gòn, Đà Nẵng...)
    for (const [unacc, acc] of Object.entries(VN_UNACCENTED_PLACES)) {
        if (unacc.startsWith(clean) || acc.startsWith(clean)) {
            if (!suggestions.includes(acc)) {
                suggestions.push(acc);
            }
        }
    }

    // Gợi ý từ PLACES_AND_NAMES_DB
    for (const [key, entry] of Object.entries(PLACES_AND_NAMES_DB)) {
        if (key.startsWith(clean) || entry.name.toLowerCase().startsWith(clean)) {
            if (!suggestions.includes(entry.name)) {
                suggestions.push(entry.name);
            }
        }
        for (const alias of entry.aliases) {
            if (alias.startsWith(clean) && !suggestions.includes(alias)) {
                suggestions.push(alias);
            }
        }
    }

    return suggestions.slice(0, limit);
}
