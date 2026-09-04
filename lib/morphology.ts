// @ts-ignore
import lemmatize from 'wink-lemmatizer';

export interface ContractionInfo {
    expansion: string;
    description: string;
    baseWord: string;
}

/**
 * Bảng tổng hợp toàn bộ các dạng viết tắt phổ biến trong tiếng Anh
 */
export const CONTRACTIONS: Record<string, ContractionInfo> = {
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
    "let's": { expansion: "let us", description: "Dạng viết tắt của 'let us' (chúng ta hãy).", baseWord: "let" },
    "i've": { expansion: "I have", description: "Dạng viết tắt của 'I have' (tôi có/đã).", baseWord: "have" },
    "you've": { expansion: "you have", description: "Dạng viết tắt của 'you have' (bạn có/đã).", baseWord: "have" },
    "we've": { expansion: "we have", description: "Dạng viết tắt của 'we have' (chúng tôi có/đã).", baseWord: "have" },
    "they've": { expansion: "they have", description: "Dạng viết tắt của 'they have' (họ có/đã).", baseWord: "have" },
    "i'd": { expansion: "I would / I had", description: "Dạng viết tắt của 'I would' hoặc 'I had'.", baseWord: "i" },
    "you'd": { expansion: "you would / you had", description: "Dạng viết tắt của 'you would' hoặc 'you had'.", baseWord: "you" },
    "he'd": { expansion: "he would / he had", description: "Dạng viết tắt của 'he would' hoặc 'he had'.", baseWord: "he" },
    "she'd": { expansion: "she would / she had", description: "Dạng viết tắt của 'she would' hoặc 'she had'.", baseWord: "she" },
    "we'd": { expansion: "we would / we had", description: "Dạng viết tắt của 'we would' hoặc 'we had'.", baseWord: "we" },
    "they'd": { expansion: "they would / they had", description: "Dạng viết tắt của 'they would' hoặc 'they had'.", baseWord: "they" },
    "i'll": { expansion: "I will / I shall", description: "Dạng viết tắt của 'I will' (tôi sẽ).", baseWord: "i" },
    "you'll": { expansion: "you will", description: "Dạng viết tắt của 'you will' (bạn sẽ).", baseWord: "you" },
    "he'll": { expansion: "he will", description: "Dạng viết tắt của 'he will' (anh ấy sẽ).", baseWord: "he" },
    "she'll": { expansion: "she will", description: "Dạng viết tắt của 'she will' (cô ấy sẽ).", baseWord: "she" },
    "we'll": { expansion: "we will", description: "Dạng viết tắt của 'we will' (chúng tôi sẽ).", baseWord: "we" },
    "they'll": { expansion: "they will", description: "Dạng viết tắt của 'they will' (họ sẽ).", baseWord: "they" },
    "ain't": { expansion: "am not / are not / is not / has not / have not", description: "Từ lóng phủ định (không là, không có).", baseWord: "be" }
};

/**
 * Lấy thông tin từ viết tắt
 */
export function getContraction(word: string): ContractionInfo | undefined {
    const key = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    return CONTRACTIONS[key];
}

export interface LemmaResult {
    lemma: string;
    posType: 'noun' | 'verb' | 'adjective';
    explanation: string;
}

/**
 * Tự động chuyển đổi hình thái từ (Lemmatization)
 * Hỗ trợ tất cả danh từ số nhiều (kể cả bất quy tắc: classes, children, mice...)
 * Hỗ trợ tất cả động từ chia thì (went, running, studied, written...)
 * Hỗ trợ tất cả tính từ so sánh (better, happiest, faster...)
 */
export function getLemmas(word: string): LemmaResult[] {
    const lower = word.trim().toLowerCase().replace(/[’‘`]/g, "'");
    if (!lower || lower.length < 2) return [];

    const results: LemmaResult[] = [];
    const seen = new Set<string>();

    try {
        // 1. Danh từ số nhiều (classes -> class, children -> child, mice -> mouse)
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

        // 3. Tính từ so sánh (better -> good, happier -> happy, fastest -> fast)
        const adjLemma = lemmatize.adjective(lower);
        if (adjLemma && adjLemma !== lower && !seen.has(adjLemma)) {
            seen.add(adjLemma);
            results.push({
                lemma: adjLemma,
                posType: 'adjective',
                explanation: `Dạng so sánh hơn / so sánh nhất của tính từ "${adjLemma}".`
            });
        }
    } catch (e) {
        console.error('Error lemmatizing word:', e);
    }

    return results;
}
