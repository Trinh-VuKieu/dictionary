import { DictionaryPronunciation } from './dictionary';

/**
 * Bảng phiên âm chuẩn US/UK cho các từ vựng tiếng Anh thông dụng và dạng biến thể bất quy tắc
 * bị thiếu trong cơ sở dữ liệu SQLite gốc.
 */
export const ENGLISH_PHONETICS_MAP: Record<string, DictionaryPronunciation[]> = {
    "have": [
        { ipa: "/hæv/", region: "US" },
        { ipa: "/hæv/", region: "UK" }
    ],
    "has": [
        { ipa: "/hæz/", region: "US" },
        { ipa: "/hæz/", region: "UK" }
    ],
    "had": [
        { ipa: "/hæd/", region: "US" },
        { ipa: "/hæd/", region: "UK" }
    ],
    "having": [
        { ipa: "/ˈhæv.ɪŋ/", region: "US" },
        { ipa: "/ˈhæv.ɪŋ/", region: "UK" }
    ],
    "am": [
        { ipa: "/æm/", region: "US" },
        { ipa: "/æm/", region: "UK" }
    ],
    "pm": [
        { ipa: "/ˌpiː ˈem/", region: "US" },
        { ipa: "/ˌpiː ˈem/", region: "UK" }
    ],

    // 1.1. Các dạng viết tắt thông dụng (Contractions)
    "don't": [
        { ipa: "/doʊnt/", region: "US" },
        { ipa: "/dəʊnt/", region: "UK" }
    ],
    "doesn't": [
        { ipa: "/ˈdʌz.ənt/", region: "US" },
        { ipa: "/ˈdʌz.ənt/", region: "UK" }
    ],
    "didn't": [
        { ipa: "/ˈdɪd.ənt/", region: "US" },
        { ipa: "/ˈdɪd.ənt/", region: "UK" }
    ],
    "can't": [
        { ipa: "/kænt/", region: "US" },
        { ipa: "/kɑːnt/", region: "UK" }
    ],
    "won't": [
        { ipa: "/woʊnt/", region: "US" },
        { ipa: "/wəʊnt/", region: "UK" }
    ],
    "isn't": [
        { ipa: "/ˈɪz.ənt/", region: "US" },
        { ipa: "/ˈɪz.ənt/", region: "UK" }
    ],
    "aren't": [
        { ipa: "/ɑːrnt/", region: "US" },
        { ipa: "/ɑːnt/", region: "UK" }
    ],
    "wasn't": [
        { ipa: "/ˈwɑːz.ənt/", region: "US" },
        { ipa: "/ˈwɒz.ənt/", region: "UK" }
    ],
    "weren't": [
        { ipa: "/wɝːnt/", region: "US" },
        { ipa: "/wɜːnt/", region: "UK" }
    ],
    "haven't": [
        { ipa: "/ˈhæv.ənt/", region: "US" },
        { ipa: "/ˈhæv.ənt/", region: "UK" }
    ],
    "hasn't": [
        { ipa: "/ˈhæz.ənt/", region: "US" },
        { ipa: "/ˈhæz.ənt/", region: "UK" }
    ],
    "hadn't": [
        { ipa: "/ˈhæd.ənt/", region: "US" },
        { ipa: "/ˈhæd.ənt/", region: "UK" }
    ],
    "wouldn't": [
        { ipa: "/ˈwʊd.ənt/", region: "US" },
        { ipa: "/ˈwʊd.ənt/", region: "UK" }
    ],
    "shouldn't": [
        { ipa: "/ˈʃʊd.ənt/", region: "US" },
        { ipa: "/ˈʃʊd.ənt/", region: "UK" }
    ],
    "couldn't": [
        { ipa: "/ˈkʊd.ənt/", region: "US" },
        { ipa: "/ˈkʊd.ənt/", region: "UK" }
    ],
    "it's": [
        { ipa: "/ɪts/", region: "US" },
        { ipa: "/ɪts/", region: "UK" }
    ],
    "that's": [
        { ipa: "/ðæts/", region: "US" },
        { ipa: "/ðæts/", region: "UK" }
    ],
    "there's": [
        { ipa: "/ðerz/", region: "US" },
        { ipa: "/ðeəz/", region: "UK" }
    ],
    "here's": [
        { ipa: "/hɪrz/", region: "US" },
        { ipa: "/hɪəz/", region: "UK" }
    ],
    "what's": [
        { ipa: "/wʌts/", region: "US" },
        { ipa: "/wɒts/", region: "UK" }
    ],
    "who's": [
        { ipa: "/huːz/", region: "US" },
        { ipa: "/huːz/", region: "UK" }
    ],
    "how's": [
        { ipa: "/haʊz/", region: "US" },
        { ipa: "/haʊz/", region: "UK" }
    ],
    "let's": [
        { ipa: "/lets/", region: "US" },
        { ipa: "/lets/", region: "UK" }
    ],
    "i'm": [
        { ipa: "/aɪm/", region: "US" },
        { ipa: "/aɪm/", region: "UK" }
    ],
    "you're": [
        { ipa: "/jʊr/", region: "US" },
        { ipa: "/jɔː/", region: "UK" }
    ],
    "we're": [
        { ipa: "/wɪr/", region: "US" },
        { ipa: "/wɪə/", region: "UK" }
    ],
    "they're": [
        { ipa: "/ðer/", region: "US" },
        { ipa: "/ðeə/", region: "UK" }
    ],
    "i've": [
        { ipa: "/aɪv/", region: "US" },
        { ipa: "/aɪv/", region: "UK" }
    ],
    "you've": [
        { ipa: "/juːv/", region: "US" },
        { ipa: "/juːv/", region: "UK" }
    ],
    "we've": [
        { ipa: "/wiːv/", region: "US" },
        { ipa: "/wiːv/", region: "UK" }
    ],
    "they've": [
        { ipa: "/ðeɪv/", region: "US" },
        { ipa: "/ðeɪv/", region: "UK" }
    ],
    "i'll": [
        { ipa: "/aɪl/", region: "US" },
        { ipa: "/aɪl/", region: "UK" }
    ],
    "you'll": [
        { ipa: "/juːl/", region: "US" },
        { ipa: "/juːl/", region: "UK" }
    ],
    "he'll": [
        { ipa: "/hiːl/", region: "US" },
        { ipa: "/hiːl/", region: "UK" }
    ],
    "she'll": [
        { ipa: "/ʃiːl/", region: "US" },
        { ipa: "/ʃiːl/", region: "UK" }
    ],
    "we'll": [
        { ipa: "/wiːl/", region: "US" },
        { ipa: "/wiːl/", region: "UK" }
    ],
    "they'll": [
        { ipa: "/ðeɪl/", region: "US" },
        { ipa: "/ðeɪl/", region: "UK" }
    ],
    "i'd": [
        { ipa: "/aɪd/", region: "US" },
        { ipa: "/aɪd/", region: "UK" }
    ],
    "you'd": [
        { ipa: "/juːd/", region: "US" },
        { ipa: "/juːd/", region: "UK" }
    ],
    "he'd": [
        { ipa: "/hiːd/", region: "US" },
        { ipa: "/hiːd/", region: "UK" }
    ],
    "she'd": [
        { ipa: "/ʃiːd/", region: "US" },
        { ipa: "/ʃiːd/", region: "UK" }
    ],
    "we'd": [
        { ipa: "/wiːd/", region: "US" },
        { ipa: "/wiːd/", region: "UK" }
    ],
    "they'd": [
        { ipa: "/ðeɪd/", region: "US" },
        { ipa: "/ðeɪd/", region: "UK" }
    ],

    // 2. Đại từ, Giới từ & Liên từ thông dụng
    "as": [
        { ipa: "/æz/", region: "US" },
        { ipa: "/æz/", region: "UK" }
    ],
    "than": [
        { ipa: "/ðæn/", region: "US" },
        { ipa: "/ðæn/", region: "UK" }
    ],
    "about": [
        { ipa: "/əˈbaʊt/", region: "US" },
        { ipa: "/əˈbaʊt/", region: "UK" }
    ],
    "most": [
        { ipa: "/moʊst/", region: "US" },
        { ipa: "/məʊst/", region: "UK" }
    ],
    "class": [
        { ipa: "/ˈklæs/", region: "US" },
        { ipa: "/ˈklɑːs/", region: "UK" }
    ],
    "classes": [
        { ipa: "/ˈklæs.ɪz/", region: "US" },
        { ipa: "/ˈklɑːs.ɪz/", region: "UK" }
    ],
    "dance": [
        { ipa: "/dæns/", region: "US" },
        { ipa: "/dɑːns/", region: "UK" }
    ],
    "fast": [
        { ipa: "/fæst/", region: "US" },
        { ipa: "/fɑːst/", region: "UK" }
    ],
    "bath": [
        { ipa: "/bæθ/", region: "US" },
        { ipa: "/bɑːθ/", region: "UK" }
    ],
    "ask": [
        { ipa: "/æsk/", region: "US" },
        { ipa: "/ɑːsk/", region: "UK" }
    ],
    "answer": [
        { ipa: "/ˈæn.sɚ/", region: "US" },
        { ipa: "/ˈɑːn.sə/", region: "UK" }
    ],
    "pass": [
        { ipa: "/pæs/", region: "US" },
        { ipa: "/pɑːs/", region: "UK" }
    ],
    "last": [
        { ipa: "/læst/", region: "US" },
        { ipa: "/lɑːst/", region: "UK" }
    ],
    "grass": [
        { ipa: "/ɡræs/", region: "US" },
        { ipa: "/ɡrɑːs/", region: "UK" }
    ],
    "glass": [
        { ipa: "/ɡlæs/", region: "US" },
        { ipa: "/ɡlɑːs/", region: "UK" }
    ],
    "plant": [
        { ipa: "/plænt/", region: "US" },
        { ipa: "/plɑːnt/", region: "UK" }
    ],
    "laugh": [
        { ipa: "/læf/", region: "US" },
        { ipa: "/lɑːf/", region: "UK" }
    ],
    "half": [
        { ipa: "/hæf/", region: "US" },
        { ipa: "/hɑːf/", region: "UK" }
    ],
    "water": [
        { ipa: "/ˈwɑː.t̬ɚ/", region: "US" },
        { ipa: "/ˈwɔː.tə/", region: "UK" }
    ],
    "schedule": [
        { ipa: "/ˈskedʒ.uːl/", region: "US" },
        { ipa: "/ˈʃedʒ.uːl/", region: "UK" }
    ],
    "either": [
        { ipa: "/ˈiː.ðɚ/", region: "US" },
        { ipa: "/ˈaɪ.ðə/", region: "UK" }
    ],
    "neither": [
        { ipa: "/ˈniː.ðɚ/", region: "US" },
        { ipa: "/ˈnaɪ.ðə/", region: "UK" }
    ],
    "tomato": [
        { ipa: "/təˈmeɪ.t̬oʊ/", region: "US" },
        { ipa: "/təˈmɑː.təʊ/", region: "UK" }
    ],
    "us": [
        { ipa: "/ʌs/", region: "US" },
        { ipa: "/ʌs/", region: "UK" }
    ],
    "into": [
        { ipa: "/ˈɪn.tuː/", region: "US" },
        { ipa: "/ˈɪn.tuː/", region: "UK" }
    ],
    "them": [
        { ipa: "/ðɛm/", region: "US" },
        { ipa: "/ðɛm/", region: "UK" }
    ],
    "other": [
        { ipa: "/ˈʌð.ɚ/", region: "US" },
        { ipa: "/ˈʌð.ə/", region: "UK" }
    ],
    "these": [
        { ipa: "/ðiːz/", region: "US" },
        { ipa: "/ðiːz/", region: "UK" }
    ],
    "your": [
        { ipa: "/jʊr/", region: "US" },
        { ipa: "/jɔː/", region: "UK" }
    ],
    "our": [
        { ipa: "/aʊr/", region: "US" },
        { ipa: "/aʊə/", region: "UK" }
    ],
    "its": [
        { ipa: "/ɪts/", region: "US" },
        { ipa: "/ɪts/", region: "UK" }
    ],

    // 3. Động từ & Danh từ thông dụng bậc cao
    "start": [
        { ipa: "/stɑːrt/", region: "US" },
        { ipa: "/stɑːt/", region: "UK" }
    ],
    "started": [
        { ipa: "/ˈstɑːr.t̬ɪd/", region: "US" },
        { ipa: "/ˈstɑː.tɪd/", region: "UK" }
    ],
    "starting": [
        { ipa: "/ˈstɑːr.t̬ɪŋ/", region: "US" },
        { ipa: "/ˈstɑː.tɪŋ/", region: "UK" }
    ],
    "starts": [
        { ipa: "/stɑːrts/", region: "US" },
        { ipa: "/stɑːts/", region: "UK" }
    ],
    "block": [
        { ipa: "/blɑːk/", region: "US" },
        { ipa: "/blɒk/", region: "UK" }
    ],
    "blocked": [
        { ipa: "/blɑːkt/", region: "US" },
        { ipa: "/blɒkt/", region: "UK" }
    ],
    "blocking": [
        { ipa: "/ˈblɑː.kɪŋ/", region: "US" },
        { ipa: "/ˈblɒ.kɪŋ/", region: "UK" }
    ],
    "feed": [
        { ipa: "/fiːd/", region: "US" },
        { ipa: "/fiːd/", region: "UK" }
    ],
    "feeding": [
        { ipa: "/ˈfiː.dɪŋ/", region: "US" },
        { ipa: "/ˈfiː.dɪŋ/", region: "UK" }
    ],
    "dive": [
        { ipa: "/daɪv/", region: "US" },
        { ipa: "/daɪv/", region: "UK" }
    ],
    "stamp": [
        { ipa: "/stæmp/", region: "US" },
        { ipa: "/stæmp/", region: "UK" }
    ],
    "grey": [
        { ipa: "/ɡreɪ/", region: "US" },
        { ipa: "/ɡreɪ/", region: "UK" }
    ],
    "gray": [
        { ipa: "/ɡreɪ/", region: "US" },
        { ipa: "/ɡreɪ/", region: "UK" }
    ],
    "cell": [
        { ipa: "/sɛl/", region: "US" },
        { ipa: "/sɛl/", region: "UK" }
    ],
    "patent": [
        { ipa: "/ˈpæt.ənt/", region: "US" },
        { ipa: "/ˈpeɪ.tənt/", region: "UK" }
    ],
    "centre": [
        { ipa: "/ˈsɛn.tɚ/", region: "US" },
        { ipa: "/ˈsɛn.tə/", region: "UK" }
    ],
    "worse": [
        { ipa: "/wɝːs/", region: "US" },
        { ipa: "/wɜːs/", region: "UK" }
    ],
    "worst": [
        { ipa: "/wɝːst/", region: "US" },
        { ipa: "/wɜːst/", region: "UK" }
    ],
    "loop": [
        { ipa: "/luːp/", region: "US" },
        { ipa: "/luːp/", region: "UK" }
    ],
    "shade": [
        { ipa: "/ʃeɪd/", region: "US" },
        { ipa: "/ʃeɪd/", region: "UK" }
    ],
    "revive": [
        { ipa: "/rɪˈvaɪv/", region: "US" },
        { ipa: "/rɪˈvaɪv/", region: "UK" }
    ],
    "plough": [
        { ipa: "/plaʊ/", region: "US" },
        { ipa: "/plaʊ/", region: "UK" }
    ],
    "couple": [
        { ipa: "/ˈkʌp.əl/", region: "US" },
        { ipa: "/ˈkʌp.əl/", region: "UK" }
    ],
    "gauge": [
        { ipa: "/ɡeɪdʒ/", region: "US" },
        { ipa: "/ɡeɪdʒ/", region: "UK" }
    ],
    "devil": [
        { ipa: "/ˈdɛv.əl/", region: "US" },
        { ipa: "/ˈdɛv.əl/", region: "UK" }
    ],
    "honour": [
        { ipa: "/ˈɑː.nɚ/", region: "US" },
        { ipa: "/ˈɒn.ə/", region: "UK" }
    ],
    "mill": [
        { ipa: "/mɪl/", region: "US" },
        { ipa: "/mɪl/", region: "UK" }
    ],
    "canon": [
        { ipa: "/ˈkæn.ən/", region: "US" },
        { ipa: "/ˈkæn.ən/", region: "UK" }
    ],
    "labour": [
        { ipa: "/ˈleɪ.bɚ/", region: "US" },
        { ipa: "/ˈleɪ.bə/", region: "UK" }
    ],
    "gear": [
        { ipa: "/ɡɪr/", region: "US" },
        { ipa: "/ɡɪə/", region: "UK" }
    ],
    "odd": [
        { ipa: "/ɑːd/", region: "US" },
        { ipa: "/ɒd/", region: "UK" }
    ],
    "pencil": [
        { ipa: "/ˈpɛn.səl/", region: "US" },
        { ipa: "/ˈpɛn.səl/", region: "UK" }
    ],
    "surprise": [
        { ipa: "/sɚˈpraɪz/", region: "US" },
        { ipa: "/səˈpraɪz/", region: "UK" }
    ],
    "wrench": [
        { ipa: "/rɛntʃ/", region: "US" },
        { ipa: "/rɛntʃ/", region: "UK" }
    ],
    "bluff": [
        { ipa: "/blʌf/", region: "US" },
        { ipa: "/blʌf/", region: "UK" }
    ],
    "old": [
        { ipa: "/oʊld/", region: "US" },
        { ipa: "/əʊld/", region: "UK" }
    ],
    "practice": [
        { ipa: "/ˈpræk.tɪs/", region: "US" },
        { ipa: "/ˈpræk.tɪs/", region: "UK" }
    ],
    "practise": [
        { ipa: "/ˈpræk.tɪs/", region: "US" },
        { ipa: "/ˈpræk.tɪs/", region: "UK" }
    ],
    "racket": [
        { ipa: "/ˈræk.ɪt/", region: "US" },
        { ipa: "/ˈræk.ɪt/", region: "UK" }
    ],
    "rhyme": [
        { ipa: "/raɪm/", region: "US" },
        { ipa: "/raɪm/", region: "UK" }
    ],
    "pie": [
        { ipa: "/paɪ/", region: "US" },
        { ipa: "/paɪ/", region: "UK" }
    ],
    "poor": [
        { ipa: "/pʊr/", region: "US" },
        { ipa: "/pɔː/", region: "UK" }
    ],
    "glow": [
        { ipa: "/ɡloʊ/", region: "US" },
        { ipa: "/ɡləʊ/", region: "UK" }
    ],
    "humble": [
        { ipa: "/ˈhʌm.bəl/", region: "US" },
        { ipa: "/ˈhʌm.bəl/", region: "UK" }
    ],
    "humour": [
        { ipa: "/ˈhjuː.mɚ/", region: "US" },
        { ipa: "/ˈhjuː.mə/", region: "UK" }
    ],
    "literature": [
        { ipa: "/ˈlɪt̬.ɚ.ə.tʃɚ/", region: "US" },
        { ipa: "/ˈlɪt.rə.tʃə/", region: "UK" }
    ],
    "magical": [
        { ipa: "/ˈmædʒ.ɪ.kəl/", region: "US" },
        { ipa: "/ˈmædʒ.ɪ.kəl/", region: "UK" }
    ],
    "script": [
        { ipa: "/skrɪpt/", region: "US" },
        { ipa: "/skrɪpt/", region: "UK" }
    ],
    "rip": [
        { ipa: "/rɪp/", region: "US" },
        { ipa: "/rɪp/", region: "UK" }
    ],
    "theatre": [
        { ipa: "/ˈθiː.ə.t̬ɚ/", region: "US" },
        { ipa: "/ˈθɪə.tə/", region: "UK" }
    ],
    "vietnamese": [
        { ipa: "/ˌvjɛt.nəˈmiːz/", region: "US" },
        { ipa: "/ˌvjɛt.nəˈmiːz/", region: "UK" }
    ],

    // 4. Động từ bất quy tắc (Quá khứ & Phân từ)
    "drew": [
        { ipa: "/druː/", region: "US" },
        { ipa: "/druː/", region: "UK" }
    ],
    "drawn": [
        { ipa: "/drɔːn/", region: "US" },
        { ipa: "/drɔːn/", region: "UK" }
    ],
    "withdrew": [
        { ipa: "/wɪðˈdruː/", region: "US" },
        { ipa: "/wɪðˈdruː/", region: "UK" }
    ],
    "withdrawn": [
        { ipa: "/wɪðˈdrɔːn/", region: "US" },
        { ipa: "/wɪðˈdrɔːn/", region: "UK" }
    ],
    "struck": [
        { ipa: "/strʌk/", region: "US" },
        { ipa: "/strʌk/", region: "UK" }
    ],
    "driven": [
        { ipa: "/ˈdrɪv.ən/", region: "US" },
        { ipa: "/ˈdrɪv.ən/", region: "UK" }
    ],
    "kept": [
        { ipa: "/kɛpt/", region: "US" },
        { ipa: "/kɛpt/", region: "UK" }
    ],
    "stuck": [
        { ipa: "/stʌk/", region: "US" },
        { ipa: "/stʌk/", region: "UK" }
    ],
    "sprang": [
        { ipa: "/spræŋ/", region: "US" },
        { ipa: "/spræŋ/", region: "UK" }
    ],
    "sprung": [
        { ipa: "/sprʌŋ/", region: "US" },
        { ipa: "/sprʌŋ/", region: "UK" }
    ],
    "flew": [
        { ipa: "/fluː/", region: "US" },
        { ipa: "/fluː/", region: "UK" }
    ],
    "risen": [
        { ipa: "/ˈrɪz.ən/", region: "US" },
        { ipa: "/ˈrɪz.ən/", region: "UK" }
    ],
    "arisen": [
        { ipa: "/əˈrɪz.ən/", region: "US" },
        { ipa: "/əˈrɪz.ən/", region: "UK" }
    ],
    "swung": [
        { ipa: "/swʌŋ/", region: "US" },
        { ipa: "/swʌŋ/", region: "UK" }
    ],
    "strung": [
        { ipa: "/strʌŋ/", region: "US" },
        { ipa: "/strʌŋ/", region: "UK" }
    ],
    "seen": [
        { ipa: "/siːn/", region: "US" },
        { ipa: "/siːn/", region: "UK" }
    ],
    "flung": [
        { ipa: "/flʌŋ/", region: "US" },
        { ipa: "/flʌŋ/", region: "UK" }
    ],
    "gave": [
        { ipa: "/ɡeɪv/", region: "US" },
        { ipa: "/ɡeɪv/", region: "UK" }
    ],
    "froze": [
        { ipa: "/froʊz/", region: "US" },
        { ipa: "/frəʊz/", region: "UK" }
    ],
    "sunk": [
        { ipa: "/sʌŋk/", region: "US" },
        { ipa: "/sʌŋk/", region: "UK" }
    ],
    "sank": [
        { ipa: "/sæŋk/", region: "US" },
        { ipa: "/sæŋk/", region: "UK" }
    ],
    "threw": [
        { ipa: "/θruː/", region: "US" },
        { ipa: "/θruː/", region: "UK" }
    ],
    "thrown": [
        { ipa: "/θroʊn/", region: "US" },
        { ipa: "/θrəʊn/", region: "UK" }
    ],
    "wore": [
        { ipa: "/wɔːr/", region: "US" },
        { ipa: "/wɔː/", region: "UK" }
    ],
    "woke": [
        { ipa: "/woʊk/", region: "US" },
        { ipa: "/wəʊk/", region: "UK" }
    ],
    "woken": [
        { ipa: "/ˈwoʊ.kən/", region: "US" },
        { ipa: "/ˈwəʊ.kən/", region: "UK" }
    ],
    "drank": [
        { ipa: "/dræŋk/", region: "US" },
        { ipa: "/dræŋk/", region: "UK" }
    ],
    "swum": [
        { ipa: "/swʌm/", region: "US" },
        { ipa: "/swʌm/", region: "UK" }
    ],
    "trod": [
        { ipa: "/trɑːd/", region: "US" },
        { ipa: "/trɒd/", region: "UK" }
    ],
    "trodden": [
        { ipa: "/ˈtrɑː.dən/", region: "US" },
        { ipa: "/ˈtrɒ.dən/", region: "UK" }
    ],
    "hung": [
        { ipa: "/hʌŋ/", region: "US" },
        { ipa: "/hʌŋ/", region: "UK" }
    ],
    "told": [
        { ipa: "/toʊld/", region: "US" },
        { ipa: "/təʊld/", region: "UK" }
    ],
    "stung": [
        { ipa: "/stʌŋ/", region: "US" },
        { ipa: "/stʌŋ/", region: "UK" }
    ],
    "spoilt": [
        { ipa: "/spɔɪlt/", region: "US" },
        { ipa: "/spɔɪlt/", region: "UK" }
    ],
    "shaken": [
        { ipa: "/ˈʃeɪ.kən/", region: "US" },
        { ipa: "/ˈʃeɪ.kən/", region: "UK" }
    ],
    "spoken": [
        { ipa: "/ˈspoʊ.kən/", region: "US" },
        { ipa: "/ˈspəʊ.kən/", region: "UK" }
    ],
    "torn": [
        { ipa: "/tɔːrn/", region: "US" },
        { ipa: "/tɔːn/", region: "UK" }
    ],
    "bade": [
        { ipa: "/bæd/", region: "US" },
        { ipa: "/bæd/", region: "UK" }
    ],
    "crept": [
        { ipa: "/krɛpt/", region: "US" },
        { ipa: "/krɛpt/", region: "UK" }
    ],
    "spilt": [
        { ipa: "/spɪlt/", region: "US" },
        { ipa: "/spɪlt/", region: "UK" }
    ],
    "slept": [
        { ipa: "/slɛpt/", region: "US" },
        { ipa: "/slɛpt/", region: "UK" }
    ],
    "said": [
        { ipa: "/sɛd/", region: "US" },
        { ipa: "/sɛd/", region: "UK" }
    ],
    "shorn": [
        { ipa: "/ʃɔːrn/", region: "US" },
        { ipa: "/ʃɔːn/", region: "UK" }
    ],
    "smitten": [
        { ipa: "/ˈsmɪt.ən/", region: "US" },
        { ipa: "/ˈsmɪt.ən/", region: "UK" }
    ],
    "smote": [
        { ipa: "/smoʊt/", region: "US" },
        { ipa: "/sməʊt/", region: "UK" }
    ],
    "sped": [
        { ipa: "/spɛd/", region: "US" },
        { ipa: "/spɛd/", region: "UK" }
    ],
    "strode": [
        { ipa: "/stroʊd/", region: "US" },
        { ipa: "/strəʊd/", region: "UK" }
    ],
    "stridden": [
        { ipa: "/ˈstrɪd.ən/", region: "US" },
        { ipa: "/ˈstrɪd.ən/", region: "UK" }
    ],
    "stank": [
        { ipa: "/stæŋk/", region: "US" },
        { ipa: "/stæŋk/", region: "UK" }
    ],
    "stunk": [
        { ipa: "/stʌŋk/", region: "US" },
        { ipa: "/stʌŋk/", region: "UK" }
    ],
    "dreamt": [
        { ipa: "/drɛmt/", region: "US" },
        { ipa: "/drɛmt/", region: "UK" }
    ],
    "knew": [
        { ipa: "/nuː/", region: "US" },
        { ipa: "/njuː/", region: "UK" }
    ],
    "known": [
        { ipa: "/noʊn/", region: "US" },
        { ipa: "/nəʊn/", region: "UK" }
    ],
    "overran": [
        { ipa: "/ˌoʊ.vɚˈræn/", region: "US" },
        { ipa: "/ˌəʊ.vəˈræn/", region: "UK" }
    ],
    "sent": [
        { ipa: "/sɛnt/", region: "US" },
        { ipa: "/sɛnt/", region: "UK" }
    ],
    "slung": [
        { ipa: "/slʌŋ/", region: "US" },
        { ipa: "/slʌŋ/", region: "UK" }
    ],
    "sold": [
        { ipa: "/soʊld/", region: "US" },
        { ipa: "/səʊld/", region: "UK" }
    ],
    "won": [
        { ipa: "/wʌn/", region: "US" },
        { ipa: "/wʌn/", region: "UK" }
    ],
    "wove": [
        { ipa: "/woʊv/", region: "US" },
        { ipa: "/wəʊv/", region: "UK" }
    ],
    "woven": [
        { ipa: "/ˈwoʊ.vən/", region: "US" },
        { ipa: "/ˈwəʊ.vən/", region: "UK" }
    ],
    "wrote": [
        { ipa: "/roʊt/", region: "US" },
        { ipa: "/rəʊt/", region: "UK" }
    ],
    "grew": [
        { ipa: "/ɡruː/", region: "US" },
        { ipa: "/ɡruː/", region: "UK" }
    ],
    "grown": [
        { ipa: "/ɡroʊn/", region: "US" },
        { ipa: "/ɡrəʊn/", region: "UK" }
    ],
    "leapt": [
        { ipa: "/lɛpt/", region: "US" },
        { ipa: "/lɛpt/", region: "UK" }
    ],
    "sung": [
        { ipa: "/sʌŋ/", region: "US" },
        { ipa: "/sʌŋ/", region: "UK" }
    ],
    "wrung": [
        { ipa: "/rʌŋ/", region: "US" },
        { ipa: "/rʌŋ/", region: "UK" }
    ],

    // 5. Danh từ số nhiều bất quy tắc
    "calves": [
        { ipa: "/kævz/", region: "US" },
        { ipa: "/kɑːvz/", region: "UK" }
    ],
    "halves": [
        { ipa: "/hævz/", region: "US" },
        { ipa: "/hɑːvz/", region: "UK" }
    ],
    "loaves": [
        { ipa: "/loʊvz/", region: "US" },
        { ipa: "/ləʊvz/", region: "UK" }
    ],
    "hooves": [
        { ipa: "/huːvz/", region: "US" },
        { ipa: "/huːvz/", region: "UK" }
    ],
    "scarves": [
        { ipa: "/skɑːrvz/", region: "US" },
        { ipa: "/skɑːvz/", region: "UK" }
    ],
    "staves": [
        { ipa: "/steɪvz/", region: "US" },
        { ipa: "/steɪvz/", region: "UK" }
    ],
    "indices": [
        { ipa: "/ˈɪn.də.siːz/", region: "US" },
        { ipa: "/ˈɪn.dɪ.siːz/", region: "UK" }
    ],
    "lives": [
        { ipa: "/laɪvz/", region: "US" },
        { ipa: "/laɪvz/", region: "UK" }
    ],
    "leaves": [
        { ipa: "/liːvz/", region: "US" },
        { ipa: "/liːvz/", region: "UK" }
    ],
    "thieves": [
        { ipa: "/θiːvz/", region: "US" },
        { ipa: "/θiːvz/", region: "UK" }
    ],
    "wolves": [
        { ipa: "/wʊlvz/", region: "US" },
        { ipa: "/wʊlvz/", region: "UK" }
    ],
    "wives": [
        { ipa: "/waɪvz/", region: "US" },
        { ipa: "/waɪvz/", region: "UK" }
    ],
    "knives": [
        { ipa: "/naɪvz/", region: "US" },
        { ipa: "/naɪvz/", region: "UK" }
    ],
    "teeth": [
        { ipa: "/tiːθ/", region: "US" },
        { ipa: "/tiːθ/", region: "UK" }
    ],
    "feet": [
        { ipa: "/fiːt/", region: "US" },
        { ipa: "/fiːt/", region: "UK" }
    ],
    "geese": [
        { ipa: "/ɡiːs/", region: "US" },
        { ipa: "/ɡiːs/", region: "UK" }
    ],
    "mice": [
        { ipa: "/maɪs/", region: "US" },
        { ipa: "/maɪs/", region: "UK" }
    ],
    "lice": [
        { ipa: "/laɪs/", region: "US" },
        { ipa: "/laɪs/", region: "UK" }
    ],
    "men": [
        { ipa: "/mɛn/", region: "US" },
        { ipa: "/mɛn/", region: "UK" }
    ],
    "women": [
        { ipa: "/ˈwɪm.ɪn/", region: "US" },
        { ipa: "/ˈwɪm.ɪn/", region: "UK" }
    ],
    "children": [
        { ipa: "/ˈtʃɪl.drən/", region: "US" },
        { ipa: "/ˈtʃɪl.drən/", region: "UK" }
    ],
    "oxen": [
        { ipa: "/ˈɑːk.sən/", region: "US" },
        { ipa: "/ˈɒk.sən/", region: "UK" }
    ]
};

/**
 * Lấy phiên âm fallback chuẩn cho từ tiếng Anh nếu trong Database bị thiếu
 */
export function getEnglishPhoneticFallback(word: string): DictionaryPronunciation[] | null {
    if (!word) return null;
    const clean = word.toLowerCase().trim();
    if (ENGLISH_PHONETICS_MAP[clean]) {
        return ENGLISH_PHONETICS_MAP[clean];
    }
    return null;
}
