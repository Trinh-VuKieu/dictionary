import { describe, it, expect, beforeAll } from 'vitest'
import { lookupWord, getSuggestions } from './dictionary'

describe('Dictionary Module', () => {

    describe('lookupWord', () => {
        it('should find Vietnamese word "xin chào"', () => {
            const result = lookupWord('xin chào')
            expect(result.exists).toBe(true)
            expect(result.word).toBe('xin chào')
            expect(result.results.length).toBeGreaterThan(0)
        })

        it('should find Vietnamese word with normalization', () => {
            // Test with i/y normalization
            const result = lookupWord('ký')
            expect(result.exists).toBe(true)
        })

        it('should return meanings with required fields', () => {
            const result = lookupWord('từ điển')
            expect(result.exists).toBe(true)

            const firstResult = result.results[0]
            expect(firstResult).toHaveProperty('lang_code')
            expect(firstResult).toHaveProperty('lang_name')
            expect(firstResult).toHaveProperty('meanings')

            if (firstResult.meanings.length > 0) {
                const meaning = firstResult.meanings[0]
                expect(meaning).toHaveProperty('definition')
                expect(meaning).toHaveProperty('definition_lang')
                expect(meaning).toHaveProperty('example')
                expect(meaning).toHaveProperty('pos')
            }
        })

        it('should filter by language code', () => {
            // Test with Vietnamese word, filter by 'vi'
            const result = lookupWord('xin chào', 'vi')
            if (result.exists) {
                expect(result.results.every(r => r.lang_code === 'vi')).toBe(true)
            }
        })

        it('should return empty results for non-existent word', () => {
            const result = lookupWord('xyznonexistent123')
            expect(result.exists).toBe(false)
            expect(result.results).toEqual([])
        })

        it('should prioritize Vietnamese results', () => {
            // Words that exist in multiple languages should show vi first
            const result = lookupWord('a')
            if (result.exists && result.results.length > 1) {
                expect(result.results[0].lang_code).toBe('vi')
            }
        })

        it('should find word "my"', () => {
            const result = lookupWord('my')
            expect(result.exists).toBe(true)
            expect(result.word).toBe('my')
            expect(result.results.length).toBeGreaterThan(0)
            const enResult = result.results.find(r => r.lang_code === 'en')
            expect(enResult).toBeDefined()
            expect(enResult!.meanings[0].definition).toContain('Của tôi')
        })

        it('should find custom contraction "he\'s"', () => {
            const result = lookupWord("he's")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("he's")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("he is")
        })

        it('should find contraction "won\'t"', () => {
            const result = lookupWord("won't")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("won't")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("will not")
        })

        it('should find contraction "they\'re"', () => {
            const result = lookupWord("they're")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("they're")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("they are")
        })

        it('should find plural form "classes" mapping to "class"', () => {
            const result = lookupWord("classes")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("classes")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("class")
        })

        it('should find superlative "happiest" mapping to "happy"', () => {
            const result = lookupWord("happiest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("happiest")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("happy")
        })

        it('should find superlative "funniest" mapping to "funny"', () => {
            const result = lookupWord("funniest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("funniest")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("funny")
        })

        it('should handle numbers like 1, 100, 2024', () => {
            const res1 = lookupWord("1")
            expect(res1.exists).toBe(true)

            const res100 = lookupWord("100")
            expect(res100.exists).toBe(true)
            expect(res100.results[0].meanings[0].definition).toContain("one hundred")

            const res2024 = lookupWord("2024")
            expect(res2024.exists).toBe(true)
            expect(res2024.results[0].meanings[0].definition).toContain("two thousand")
        })

        it('should handle ordinal numbers like 1st, 2nd', () => {
            const res1st = lookupWord("1st")
            expect(res1st.exists).toBe(true)
            expect(res1st.results[0].meanings[0].definition).toContain("first")
        })

        it('should handle Roman numerals like IV, X', () => {
            const resIV = lookupWord("IV")
            expect(resIV.exists).toBe(true)
            expect(resIV.results[0].meanings[0].definition).toContain("4")
        })

        it('should handle time formats like 10:30, 7am', () => {
            const resTime = lookupWord("10:30")
            expect(resTime.exists).toBe(true)
            expect(resTime.results[0].meanings[0].definition).toContain("ten thirty")

            const res7am = lookupWord("7am")
            expect(res7am.exists).toBe(true)
        })

        it('should handle essential core words: why, which, whose, only, o\'clock', () => {
            expect(lookupWord("why").exists).toBe(true)
            expect(lookupWord("which").exists).toBe(true)
            expect(lookupWord("whose").exists).toBe(true)
            expect(lookupWord("only").exists).toBe(true)
            expect(lookupWord("o'clock").exists).toBe(true)
        })

        it('should handle -ly adverbs like usually, really, rarely', () => {
            const resUsually = lookupWord("usually")
            expect(resUsually.exists).toBe(true)
            expect(resUsually.results.length).toBeGreaterThan(0)

            const resReally = lookupWord("really")
            expect(resReally.exists).toBe(true)
            expect(resReally.results.length).toBeGreaterThan(0)
        })
    })

    describe('getSuggestions', () => {
        it('should return suggestions for prefix', () => {
            const suggestions = getSuggestions('xin', 5)
            expect(suggestions.length).toBeGreaterThan(0)
            expect(suggestions.every(s => s.startsWith('xin'))).toBe(true)
        })

        it('should respect limit parameter', () => {
            const suggestions = getSuggestions('a', 3)
            expect(suggestions.length).toBeLessThanOrEqual(3)
        })

        it('should filter by language', () => {
            const suggestions = getSuggestions('hel', 5, 'en')
            expect(suggestions.length).toBeGreaterThanOrEqual(0)
        })

        it('should return empty array for no matches', () => {
            const suggestions = getSuggestions('xyznonexistent', 5)
            expect(suggestions).toEqual([])
        })

        it('should suggest custom words when typing prefix', () => {
            const suggestions = getSuggestions("he'", 5)
            expect(suggestions).toContain("he's")

            const classSuggestions = getSuggestions("clas", 5)
            expect(classSuggestions).toContain("classes")
        })
    })

    describe('DictionaryMeaning structure', () => {
        it('should have correct example format (backward compatible)', () => {
            const result = lookupWord('đảo')
            expect(result.exists).toBe(true)

            // Find a meaning with example
            const meaningWithExample = result.results
                .flatMap(r => r.meanings)
                .find(m => m.example !== null)

            if (meaningWithExample) {
                // Current format: example is string
                expect(typeof meaningWithExample.example).toBe('string')
            }
        })

        it('should have links as array', () => {
            const result = lookupWord('từ điển')
            expect(result.exists).toBe(true)

            if (result.results[0]?.meanings[0]) {
                expect(Array.isArray(result.results[0].meanings[0].links)).toBe(true)
            }
        })
    })
})
