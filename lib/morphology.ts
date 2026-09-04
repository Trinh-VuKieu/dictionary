// @ts-ignore
import lemmatize from 'wink-lemmatizer';

export interface ContractionInfo {
    expansion: string;
    description: string;
    baseWord: string;
}

/**
 * Bảng tổng hợp toàn bộ các dạng viết tắt, từ rút gọn khẩu ngữ & trợ động từ trong tiếng Anh
 */
export const CONTRACTIONS: Record<string, ContractionInfo> = {
    // 1. Đại từ + Be / Have
    "he's": { expansion: "he is / he has", description: "Dạng viết tắt của 'he is' (anh ấy là/ở) hoặc 'he has' (anh ấy có/đã).", baseWord: "he" },
    "she's": { expansion: "she is / she has", description: "Dạng viết tắt của 'she is' (cô ấy là/ở) hoặc 'she has' (cô ấy có/đã).", baseWord: "she" },
    "it's": { expansion: "it is / it has", description: "Dạng viết tắt của 'it is' (nó là/ở) hoặc 'it has' (nó có/đã).", baseWord: "it" },
    "i'm": { expansion: "I am", description: "Dạng viết tắt của 'I am' (tôi là/ở).", baseWord: "i" },
    "you're": { expansion: "you are", description: "Dạng viết tắt của 'you are' (bạn là/ở).", baseWord: "you" },
    "we're": { expansion: "we are", description: "Dạng viết tắt của 'we are' (chúng tôi là/ở).", baseWord: "we" },
    "they're": { expansion: "they are", description: "Dạng viết tắt của 'they are' (họ là/ở).", baseWord: "they" },
    "that's": { expansion: "that is", description: "Dạng viết tắt của 'that is' (đó là).", baseWord: "that" },
    "there's": { expansion: "there is / there has", description: "Dạng viết tắt của 'there is' (có).", baseWord: "there" },
    "here's": { expansion: "here is", description: "Dạng viết tắt của 'here is' (đây là).", baseWord: "here" },
    "what's": { expansion: "what is / what has", description: "Dạng viết tắt của 'what is' (cái gì là/có).", baseWord: "what" },
    "who's": { expansion: "who is / who has", description: "Dạng viết tắt của 'who is' (ai là/có).", baseWord: "who" },
    "where's": { expansion: "where is", description: "Dạng viết tắt của 'where is' (ở đâu là).", baseWord: "where" },
    "when's": { expansion: "when is", description: "Dạng viết tắt của 'when is' (khi nào là).", baseWord: "when" },
    "why's": { expansion: "why is", description: "Dạng viết tắt của 'why is' (tại sao là).", baseWord: "why" },
    "how's": { expansion: "how is / how has", description: "Dạng viết tắt của 'how is' (thế nào là).", baseWord: "how" },

    // 2. Đại từ + Have
    "i've": { expansion: "I have", description: "Dạng viết tắt của 'I have' (tôi có/đã).", baseWord: "have" },
    "you've": { expansion: "you have", description: "Dạng viết tắt của 'you have' (bạn có/đã).", baseWord: "have" },
    "we've": { expansion: "we have", description: "Dạng viết tắt của 'we have' (chúng tôi có/đã).", baseWord: "have" },
    "they've": { expansion: "they have", description: "Dạng viết tắt của 'they have' (họ có/đã).", baseWord: "have" },

    // 3. Đại từ + Would / Had
    "i'd": { expansion: "I would / I had", description: "Dạng viết tắt của 'I would' hoặc 'I had'.", baseWord: "i" },
    "you'd": { expansion: "you would / you had", description: "Dạng viết tắt của 'you would' hoặc 'you had'.", baseWord: "you" },
    "he'd": { expansion: "he would / he had", description: "Dạng viết tắt của 'he would' hoặc 'he had'.", baseWord: "he" },
    "she'd": { expansion: "she would / she had", description: "Dạng viết tắt của 'she would' hoặc 'she had'.", baseWord: "she" },
    "it'd": { expansion: "it would / it had", description: "Dạng viết tắt của 'it would' hoặc 'it had'.", baseWord: "it" },
    "we'd": { expansion: "we would / we had", description: "Dạng viết tắt của 'we would' hoặc 'we had'.", baseWord: "we" },
    "they'd": { expansion: "they would / they had", description: "Dạng viết tắt của 'they would' hoặc 'they had'.", baseWord: "they" },

    // 4. Đại từ + Will
    "i'll": { expansion: "I will / I shall", description: "Dạng viết tắt của 'I will' (tôi sẽ).", baseWord: "i" },
    "you'll": { expansion: "you will", description: "Dạng viết tắt của 'you will' (bạn sẽ).", baseWord: "you" },
    "he'll": { expansion: "he will", description: "Dạng viết tắt của 'he will' (anh ấy sẽ).", baseWord: "he" },
    "she'll": { expansion: "she will", description: "Dạng viết tắt của 'she will' (cô ấy sẽ).", baseWord: "she" },
    "it'll": { expansion: "it will", description: "Dạng viết tắt của 'it will' (nó sẽ).", baseWord: "it" },
    "we'll": { expansion: "we will", description: "Dạng viết tắt của 'we will' (chúng tôi sẽ).", baseWord: "we" },
    "they'll": { expansion: "they will", description: "Dạng viết tắt của 'they will' (họ sẽ).", baseWord: "they" },

    // 5. Wh-questions + Did / Would
    "how'd": { expansion: "how did / how would", description: "Dạng viết tắt của 'how did' hoặc 'how would'.", baseWord: "how" },
    "why'd": { expansion: "why did / why would", description: "Dạng viết tắt của 'why did' hoặc 'why would'.", baseWord: "why" },
    "where'd": { expansion: "where did / where would", description: "Dạng viết tắt của 'where did' hoặc 'where would'.", baseWord: "where" },
    "when'd": { expansion: "when did / when would", description: "Dạng viết tắt của 'when did' hoặc 'when would'.", baseWord: "when" },
    "what'd": { expansion: "what did / what would", description: "Dạng viết tắt của 'what did' hoặc 'what would'.", baseWord: "what" },
    "who'd": { expansion: "who did / who would / who had", description: "Dạng viết tắt của 'who did / who would / who had'.", baseWord: "who" },

    // 6. Phủ định trợ động từ (Negative Contractions)
    "can't": { expansion: "cannot", description: "Dạng viết tắt của 'cannot' (không thể).", baseWord: "can" },
    "cannot": { expansion: "cannot", description: "Không thể.", baseWord: "can" },
    "won't": { expansion: "will not", description: "Dạng viết tắt của 'will not' (sẽ không).", baseWord: "will" },
    "don't": { expansion: "do not", description: "Dạng viết tắt của 'do not' (không làm / đừng).", baseWord: "do" },
    "doesn't": { expansion: "does not", description: "Dạng viết tắt của 'does not' (không làm).", baseWord: "do" },
    "didn't": { expansion: "did not", description: "Dạng viết tắt của 'did not' (đã không làm).", baseWord: "do" },
    "isn't": { expansion: "is not", description: "Dạng viết tắt của 'is not' (không phải là).", baseWord: "be" },
    "aren't": { expansion: "are not", description: "Dạng viết tắt của 'are not' (không phải là).", baseWord: "be" },
    "wasn't": { expansion: "was not", description: "Dạng viết tắt của 'was not' (đã không phải là).", baseWord: "be" },
    "weren't": { expansion: "were not", description: "Dạng viết tắt của 'were not' (đã không phải là).", baseWord: "be" },
    "haven't": { expansion: "have not", description: "Dạng viết tắt của 'have not' (chưa có / chưa từng).", baseWord: "have" },
    "hasn't": { expansion: "has not", description: "Dạng viết tắt của 'has not' (chưa có / chưa từng).", baseWord: "have" },
    "hadn't": { expansion: "had not", description: "Dạng viết tắt của 'had not' (đã không có).", baseWord: "have" },
    "wouldn't": { expansion: "would not", description: "Dạng viết tắt của 'would not' (sẽ không).", baseWord: "would" },
    "couldn't": { expansion: "could not", description: "Dạng viết tắt của 'could not' (đã không thể).", baseWord: "could" },
    "shouldn't": { expansion: "should not", description: "Dạng viết tắt của 'should not' (không nên).", baseWord: "should" },
    "mustn't": { expansion: "must not", description: "Dạng viết tắt của 'must not' (không được phép).", baseWord: "must" },
    "needn't": { expansion: "need not", description: "Dạng viết tắt của 'need not' (không cần phải).", baseWord: "need" },
    "oughtn't": { expansion: "ought not", description: "Dạng viết tắt của 'ought not' (không nên).", baseWord: "ought" },
    "shan't": { expansion: "shall not", description: "Dạng viết tắt của 'shall not' (sẽ không).", baseWord: "shall" },
    "mightn't": { expansion: "might not", description: "Dạng viết tắt của 'might not' (có thể không).", baseWord: "might" },
    "daren't": { expansion: "dare not", description: "Dạng viết tắt của 'dare not' (không dám).", baseWord: "dare" },
    "mayn't": { expansion: "may not", description: "Dạng viết tắt của 'may not' (không thể).", baseWord: "may" },
    "ain't": { expansion: "am not / are not / is not / has not / have not", description: "Từ lóng phủ định (không là, không có).", baseWord: "be" },

    // 7. Từ rút gọn khẩu ngữ phổ biến (Informal & Slang Contractions)
    "gonna": { expansion: "going to", description: "Dạng rút gọn khẩu ngữ của 'going to' (sắp, sẽ làm gì).", baseWord: "go" },
    "wanna": { expansion: "want to / want a", description: "Dạng rút gọn khẩu ngữ của 'want to' (muốn làm gì) hoặc 'want a'.", baseWord: "want" },
    "gotta": { expansion: "got to / have got to", description: "Dạng rút gọn khẩu ngữ của 'have got to' (phải làm gì).", baseWord: "get" },
    "kinda": { expansion: "kind of", description: "Dạng rút gọn khẩu ngữ của 'kind of' (đại loại, hơi).", baseWord: "kind" },
    "sorta": { expansion: "sort of", description: "Dạng rút gọn khẩu ngữ của 'sort of' (hơi, có vẻ).", baseWord: "sort" },
    "dunno": { expansion: "don't know", description: "Dạng rút gọn khẩu ngữ của 'don't know' (không biết).", baseWord: "know" },
    "lemme": { expansion: "let me", description: "Dạng rút gọn khẩu ngữ của 'let me' (để tôi làm gì).", baseWord: "let" },
    "gimme": { expansion: "give me", description: "Dạng rút gọn khẩu ngữ của 'give me' (đưa cho tôi).", baseWord: "give" },
    "y'all": { expansion: "you all", description: "Dạng rút gọn thân mật của 'you all' (các bạn, mọi người).", baseWord: "you" },
    "cuz": { expansion: "because", description: "Dạng viết tắt tin nhắn/khẩu ngữ của 'because' (bởi vì).", baseWord: "because" },
    "'cause": { expansion: "because", description: "Dạng viết tắt của 'because' (bởi vì).", baseWord: "because" },
    "imma": { expansion: "I'm going to", description: "Dạng rút gọn lóng của 'I am going to' (tôi sẽ).", baseWord: "i" },
    "outta": { expansion: "out of", description: "Dạng rút gọn khẩu ngữ của 'out of' (ra khỏi, hết sạch).", baseWord: "out" },
    "woulda": { expansion: "would have", description: "Dạng rút gọn khẩu ngữ của 'would have' (lẽ ra đã).", baseWord: "would" },
    "coulda": { expansion: "could have", description: "Dạng rút gọn khẩu ngữ của 'could have' (đã có thể).", baseWord: "could" },
    "shoulda": { expansion: "should have", description: "Dạng rút gọn khẩu ngữ của 'should have' (lẽ ra nên).", baseWord: "should" },
    "musta": { expansion: "must have", description: "Dạng rút gọn khẩu ngữ của 'must have' (chắc hẳn đã).", baseWord: "must" },
    "let's": { expansion: "let us", description: "Dạng viết tắt của 'let us' (chúng ta hãy cùng nhau làm gì).", baseWord: "let" },
    "ma'am": { expansion: "madam", description: "Dạng rút gọn tôn kính của 'madam' (thưa bà, quý cô).", baseWord: "madam" },
    "o'clock": { expansion: "of the clock", description: "Giờ đúng (viết tắt của 'of the clock', chỉ thời gian).", baseWord: "clock" }
};

/**
 * Lấy thông tin từ viết tắt
 */
export function getContraction(word: string): ContractionInfo | undefined {
    const key = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    return CONTRACTIONS[key];
}

/**
 * Xử lý dạng sở hữu cách trong tiếng Anh (Possessive Case)
 * Ví dụ: dog's -> dog, teacher's -> teacher, students' -> students
 */
export function getPossessive(word: string): { base: string; explanation: string } | null {
    const lower = word.trim().toLowerCase().replace(/[’‘`]/g, "'");

    if (lower.endsWith("'s") && lower.length > 2) {
        const base = lower.slice(0, -2);
        return {
            base,
            explanation: `Dạng sở hữu cách (Possessive case) của "${base}" (nghĩa là "của ${base}").`
        };
    }

    if (lower.endsWith("s'") && lower.length > 2) {
        const base = lower.slice(0, -1);
        return {
            base,
            explanation: `Dạng sở hữu cách số nhiều của "${base}" (nghĩa là "của các ${base.slice(0, -1)}").`
        };
    }

    return null;
}

/**
 * Bảng ánh xạ biến thể chính tả Anh - Mỹ (British vs American Spelling)
 */
const UK_US_PAIRS: [RegExp, string][] = [
    // -our <-> -or (colour -> color, flavour -> flavor...)
    [/our$/, 'or'],
    [/or$/, 'our'],
    // -ise <-> -ize (organise -> organize, realise -> realize...)
    [/ise$/, 'ize'],
    [/ize$/, 'ise'],
    // -re <-> -er (theatre -> theater, centre -> center...)
    [/re$/, 'er'],
    [/er$/, 're'],
    // -ence <-> -ense (defence -> defense, licence -> license...)
    [/ence$/, 'ense'],
    [/ense$/, 'ence'],
    // -ogue <-> -og (catalogue -> catalog, dialogue -> dialog...)
    [/ogue$/, 'og'],
    [/og$/, 'ogue'],
    // Doubled l (travelling -> traveling, cancelled -> canceled...)
    [/lling$/, 'ling'],
    [/ling$/, 'lling'],
    [/lled$/, 'led'],
    [/led$/, 'lled']
];

/**
 * Lấy danh sách các biến thể chính tả Anh-Mỹ hoặc từ ghép có dấu gạch ngang
 */
export function getSpellingVariants(word: string): string[] {
    const lower = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    const variants: string[] = [];

    // 1. Biến thể dấu gạch nối (well-known <-> well known)
    if (lower.includes('-')) {
        variants.push(lower.replace(/-/g, ' '));
        variants.push(lower.replace(/-/g, ''));
    }
    if (lower.includes(' ')) {
        variants.push(lower.replace(/\s+/g, '-'));
        variants.push(lower.replace(/\s+/g, ''));
    }

    // 2. Biến thể Anh - Mỹ
    for (const [pattern, replacement] of UK_US_PAIRS) {
        if (pattern.test(lower)) {
            const transformed = lower.replace(pattern, replacement);
            if (transformed !== lower && !variants.includes(transformed)) {
                variants.push(transformed);
            }
        }
    }

    // Một số từ biến thể đặc biệt
    const SPECIAL_VARIANTS: Record<string, string> = {
        'grey': 'gray',
        'gray': 'grey',
        'programme': 'program',
        'program': 'programme',
        'tyre': 'tire',
        'tire': 'tyre',
        'cheque': 'check',
        'check': 'cheque',
        'aeroplane': 'airplane',
        'airplane': 'aeroplane',
        'aluminium': 'aluminum',
        'aluminum': 'aluminium'
    };
    if (SPECIAL_VARIANTS[lower] && !variants.includes(SPECIAL_VARIANTS[lower])) {
        variants.push(SPECIAL_VARIANTS[lower]);
    }

    return variants;
}

export interface LemmaResult {
    lemma: string;
    posType: 'noun' | 'verb' | 'adjective';
    explanation: string;
}

/**
 * Tự động chuyển đổi hình thái từ (Lemmatization)
 * Hỗ trợ tất cả danh từ số nhiều (kể cả bất quy tắc: classes, children, mice, teeth, criteria...)
 * Hỗ trợ tất cả động từ chia thì (went, running, studied, written, having...)
 * Hỗ trợ tất cả tính từ so sánh (better, happiest, faster, bigger...)
 * Hỗ trợ phó từ đuôi -ly (really, usually, happily...)
 */
export function getLemmas(word: string): LemmaResult[] {
    const lower = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    if (!lower || lower.length < 2) return [];

    const results: LemmaResult[] = [];
    const seen = new Set<string>();

    try {
        // 1. Danh từ số nhiều (classes -> class, children -> child, mice -> mouse, teeth -> tooth)
        const nounLemma = lemmatize.noun(lower);
        if (nounLemma && nounLemma !== lower && !seen.has(nounLemma)) {
            seen.add(nounLemma);
            results.push({
                lemma: nounLemma,
                posType: 'noun',
                explanation: `Dạng số nhiều của danh từ "${nounLemma}".`
            });
        }

        // 2. Động từ chia thì (went -> go, running -> run, studied -> study, classes -> class)
        const verbLemma = lemmatize.verb(lower);
        if (verbLemma && verbLemma !== lower && !seen.has(verbLemma)) {
            seen.add(verbLemma);
            results.push({
                lemma: verbLemma,
                posType: 'verb',
                explanation: `Dạng chia thì (quá khứ / phân từ / tiếp diễn / ngôi thứ ba) của động từ "${verbLemma}".`
            });
        }

        // 3. Tính từ so sánh (better -> good, happier -> happy, fastest -> fast, bigger -> big)
        const adjLemma = lemmatize.adjective(lower);
        if (adjLemma && adjLemma !== lower && !seen.has(adjLemma)) {
            seen.add(adjLemma);
            results.push({
                lemma: adjLemma,
                posType: 'adjective',
                explanation: `Dạng so sánh hơn / so sánh nhất của tính từ "${adjLemma}".`
            });
        }

        // 4. Khử gấp đôi phụ âm cho động từ đuôi -ing (running -> run, stopping -> stop, planning -> plan, getting -> get, swimming -> swim, winning -> win)
        if (lower.endsWith('ing') && lower.length > 5) {
            const root = lower.slice(0, -3);
            const l = root.length;
            if (l >= 3 && root[l - 1] === root[l - 2] && !/[aeiouy]/.test(root[l - 1])) {
                const singleConsonant = root.slice(0, -1);
                if (!seen.has(singleConsonant)) {
                    seen.add(singleConsonant);
                    results.push({
                        lemma: singleConsonant,
                        posType: 'verb',
                        explanation: `Dạng phân từ hiện tại / tiếp diễn (V-ing) của động từ "${singleConsonant}".`
                    });
                }
            }
        }

        // 5. Khử gấp đôi phụ âm cho động từ đuôi -ed (stopped -> stop, planned -> plan, dropped -> drop)
        if (lower.endsWith('ed') && lower.length > 5) {
            const root = lower.slice(0, -2);
            const l = root.length;
            if (l >= 3 && root[l - 1] === root[l - 2] && !/[aeiouy]/.test(root[l - 1])) {
                const singleConsonant = root.slice(0, -1);
                if (!seen.has(singleConsonant)) {
                    seen.add(singleConsonant);
                    results.push({
                        lemma: singleConsonant,
                        posType: 'verb',
                        explanation: `Dạng quá khứ / phân từ hai (V-ed) của động từ "${singleConsonant}".`
                    });
                }
            }
        }

        // 6. Phó từ đuôi -ly (usually -> usual, really -> real, rarely -> rare, happily -> happy, quickly -> quick)
        if (lower.endsWith('ily') && lower.length > 4) {
            const adjBase = lower.slice(0, -3) + 'y';
            if (!seen.has(adjBase)) {
                seen.add(adjBase);
                results.push({
                    lemma: adjBase,
                    posType: 'adjective',
                    explanation: `Phó từ / Trạng từ được cấu tạo từ tính từ "${adjBase}" + đuôi "-ly".`
                });
            }
        } else if (lower.endsWith('ly') && lower.length > 3) {
            const adjBase = lower.slice(0, -2);
            if (!seen.has(adjBase)) {
                seen.add(adjBase);
                results.push({
                    lemma: adjBase,
                    posType: 'adjective',
                    explanation: `Phó từ / Trạng từ được cấu tạo từ tính từ "${adjBase}" + đuôi "-ly".`
                });
            }
        }
    } catch (e) {
        console.error('Error lemmatizing word:', e);
    }

    return results;
}
