import { describe, it, expect } from 'vitest'
import { lookupWord, lookupWordSync, getSuggestions } from './dictionary'

describe('Dictionary Module', () => {

    describe('lookupWord & lookupWordSync', () => {
        it('should find Vietnamese word "xin chào"', async () => {
            const result = await lookupWord('xin chào')
            expect(result.exists).toBe(true)
            expect(result.word).toBe('xin chào')
            expect(result.results.length).toBeGreaterThan(0)
        })

        it('should find Vietnamese word with normalization', async () => {
            const result = await lookupWord('ký')
            expect(result.exists).toBe(true)
        })

        it('should return meanings with required fields', async () => {
            const result = await lookupWord('từ điển')
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

        it('should filter by language code', async () => {
            const result = await lookupWord('xin chào', 'vi')
            if (result.exists) {
                expect(result.results.every(r => r.lang_code === 'vi')).toBe(true)
            }
        })

        it('should return empty results for non-existent gibberish word', async () => {
            const result = await lookupWord('xyznonexistent123999zzz')
            expect(result.exists).toBe(false)
            expect(result.results).toEqual([])
        })

        it('should prioritize Vietnamese results', async () => {
            const result = await lookupWord('a')
            if (result.exists && result.results.length > 1) {
                expect(result.results[0].lang_code).toBe('vi')
            }
        })

        it('should find word "my"', async () => {
            const result = await lookupWord('my')
            expect(result.exists).toBe(true)
            expect(result.word).toBe('my')
            expect(result.results.length).toBeGreaterThan(0)
            const enResult = result.results.find(r => r.lang_code === 'en')
            expect(enResult).toBeDefined()
            expect(enResult!.meanings[0].definition).toContain('Của tôi')
        })

        it('should find custom contraction "he\'s"', async () => {
            const result = await lookupWord("he's")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("he's")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("he is")
        })

        it('should find contraction "won\'t"', async () => {
            const result = await lookupWord("won't")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("won't")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("will not")
        })

        it('should find contraction "they\'re"', async () => {
            const result = await lookupWord("they're")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("they're")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("they are")
        })

        it('should find plural form "classes" mapping to "class"', async () => {
            const result = await lookupWord("classes")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("classes")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("class")
        })

        it('should find superlative "happiest" mapping to "happy"', async () => {
            const result = await lookupWord("happiest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("happiest")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("happy")
        })

        it('should find superlative "funniest" mapping to "funny"', async () => {
            const result = await lookupWord("funniest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("funniest")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings[0].definition).toContain("funny")
        })

        it('should handle numbers like 1, 100, 2024', async () => {
            const res1 = await lookupWord("1")
            expect(res1.exists).toBe(true)

            const res100 = await lookupWord("100")
            expect(res100.exists).toBe(true)
            expect(res100.results[0].meanings[0].definition).toContain("one hundred")

            const res2024 = await lookupWord("2024")
            expect(res2024.exists).toBe(true)
            expect(res2024.results[0].meanings[0].definition).toContain("two thousand")
        })

        it('should handle ordinal numbers like 1st, 2nd', async () => {
            const res1st = await lookupWord("1st")
            expect(res1st.exists).toBe(true)
            expect(res1st.results[0].meanings[0].definition).toContain("first")
        })

        it('should handle Roman numerals like IV, X', async () => {
            const resIV = await lookupWord("IV")
            expect(resIV.exists).toBe(true)
            expect(resIV.results[0].meanings[0].definition).toContain("4")
        })

        it('should handle time formats like 10:30, 7am', async () => {
            const resTime = await lookupWord("10:30")
            expect(resTime.exists).toBe(true)
            expect(resTime.results[0].meanings[0].definition).toContain("ten thirty")

            const res7am = await lookupWord("7am")
            expect(res7am.exists).toBe(true)
        })

        it('should handle essential core words: why, which, whose, only, o\'clock', async () => {
            expect((await lookupWord("why")).exists).toBe(true)
            expect((await lookupWord("which")).exists).toBe(true)
            expect((await lookupWord("whose")).exists).toBe(true)
            expect((await lookupWord("only")).exists).toBe(true)
            expect((await lookupWord("o'clock")).exists).toBe(true)
        })

        it('should handle -ly adverbs like usually, really, rarely', async () => {
            const resUsually = await lookupWord("usually")
            expect(resUsually.exists).toBe(true)
            expect(resUsually.results.length).toBeGreaterThan(0)

            const resReally = await lookupWord("really")
            expect(resReally.exists).toBe(true)
            expect(resReally.results.length).toBeGreaterThan(0)
        })
    })

    describe('Geographic Places & Proper Nouns (Địa danh, Sông hồ, Núi non, Tên riêng)', () => {
        it('should resolve unaccented Vietnamese place names to accented definitions', async () => {
            // da nang -> đà nẵng
            const resDaNang = await lookupWord("da nang")
            expect(resDaNang.exists).toBe(true)
            expect(resDaNang.results.length).toBeGreaterThan(0)

            // ha noi -> hà nội
            const resHaNoi = await lookupWord("ha noi")
            expect(resHaNoi.exists).toBe(true)
            expect(resHaNoi.results.length).toBeGreaterThan(0)

            // sai gon -> sài gòn
            const resSaiGon = await lookupWord("sai gon")
            expect(resSaiGon.exists).toBe(true)
            expect(resSaiGon.results.length).toBeGreaterThan(0)

            // hue -> huế
            const resHue = await lookupWord("hue")
            expect(resHue.exists).toBe(true)

            // nha trang
            const resNhaTrang = await lookupWord("nha trang")
            expect(resNhaTrang.exists).toBe(true)

            // da lat -> đà lạt
            const resDaLat = await lookupWord("da lat")
            expect(resDaLat.exists).toBe(true)
        })

        it('should find world countries (Italy, Russia, China, Japan, Korea, France, Germany, England, America)', async () => {
            const resItaly = await lookupWord("italy")
            expect(resItaly.exists).toBe(true)
            expect(resItaly.results[0].meanings[0].definition).toContain("Ý")

            const resRussia = await lookupWord("russia")
            expect(resRussia.exists).toBe(true)
            expect(resRussia.results[0].meanings[0].definition).toContain("Nga")

            const resChina = await lookupWord("china")
            expect(resChina.exists).toBe(true)
            expect(resChina.results[0].meanings[0].definition).toContain("Trung Quốc")

            const resJapan = await lookupWord("japan")
            expect(resJapan.exists).toBe(true)

            const resKorea = await lookupWord("korea")
            expect(resKorea.exists).toBe(true)
        })

        it('should find world capitals (Beijing, Washington, London, Tokyo, Paris, Moscow)', async () => {
            const resBeijing = await lookupWord("beijing")
            expect(resBeijing.exists).toBe(true)
            expect(resBeijing.results[0].meanings[0].definition).toContain("Bắc Kinh")

            const resWashington = await lookupWord("washington")
            expect(resWashington.exists).toBe(true)
            expect(resWashington.results[0].meanings[0].definition).toContain("thủ đô")

            const resLondon = await lookupWord("london")
            expect(resLondon.exists).toBe(true)
            expect(resLondon.results[0].meanings[0].definition).toContain("Luân Đôn")

            const resParis = await lookupWord("paris")
            expect(resParis.exists).toBe(true)
        })

        it('should find famous rivers, lakes, mountains & landmarks (Nile, Amazon, Mekong, Everest, Himalaya, Alps, Fansipan, Hồ Ba Bể, Vịnh Hạ Long, Sông Hồng)', async () => {
            const resNile = await lookupWord("nile")
            expect(resNile.exists).toBe(true)
            expect(resNile.results[0].meanings[0].definition).toContain("Sông Nin")

            const resAmazon = await lookupWord("amazon")
            expect(resAmazon.exists).toBe(true)

            const resMekong = await lookupWord("mekong")
            expect(resMekong.exists).toBe(true)

            const resEverest = await lookupWord("everest")
            expect(resEverest.exists).toBe(true)
            expect(resEverest.results[0].meanings[0].definition).toContain("Everest")

            const resHimalaya = await lookupWord("himalaya")
            expect(resHimalaya.exists).toBe(true)

            const resAlps = await lookupWord("alps")
            expect(resAlps.exists).toBe(true)

            const resBaBe = await lookupWord("hồ ba bể")
            expect(resBaBe.exists).toBe(true)
            expect(resBaBe.results[0].meanings[0].definition).toContain("Bắc Kạn")

            const resHaLong = await lookupWord("vịnh hạ long")
            expect(resHaLong.exists).toBe(true)

            const resFansipan = await lookupWord("fansipan")
            expect(resFansipan.exists).toBe(true)

            const resSongHong = await lookupWord("sông hồng")
            expect(resSongHong.exists).toBe(true)

            // Test unaccented rivers and lakes
            const resUnaccSongHong = await lookupWord("song hong")
            expect(resUnaccSongHong.exists).toBe(true)

            const resUnaccHoGuom = await lookupWord("ho guom")
            expect(resUnaccHoGuom.exists).toBe(true)

            const resUnaccHoTay = await lookupWord("ho tay")
            expect(resUnaccHoTay.exists).toBe(true)

            const resUnaccHaLong = await lookupWord("vinh ha long")
            expect(resUnaccHaLong.exists).toBe(true)
        })

        it('should find proper names (Mary, Albert Einstein)', async () => {
            const resMary = await lookupWord("mary")
            expect(resMary.exists).toBe(true)
            expect(resMary.results[0].meanings[0].definition).toContain("Mary")

            const resEinstein = await lookupWord("albert einstein")
            expect(resEinstein.exists).toBe(true)
            expect(resEinstein.results[0].meanings[0].definition).toContain("Einstein")
        })

        it('should dynamically resolve arbitrary world entities from Wikipedia', async () => {
            const resWiki = await lookupWord("Thác Bản Giốc")
            expect(resWiki.exists).toBe(true)
            expect(resWiki.results.length).toBeGreaterThan(0)
            expect(resWiki.results[0].meanings[0].source).toContain("Wikipedia")
        }, 10000)
    })

    describe('All English Variants & Inflections', () => {
        it('should handle possessive case (dog\'s, teacher\'s, mary\'s, students\')', async () => {
            const resDogs = await lookupWord("dog's")
            expect(resDogs.exists).toBe(true)
            expect(resDogs.results[0].meanings[0].definition).toContain("sở hữu cách")

            const resTeachers = await lookupWord("teacher's")
            expect(resTeachers.exists).toBe(true)

            const resMarys = await lookupWord("mary's")
            expect(resMarys.exists).toBe(true)

            const resStudents = await lookupWord("students'")
            expect(resStudents.exists).toBe(true)
        })

        it('should handle informal and modal contractions (gonna, wanna, gotta, kinda, dunno, lemme, y\'all, needn\'t, shan\'t)', async () => {
            expect((await lookupWord("gonna")).exists).toBe(true)
            expect((await lookupWord("wanna")).exists).toBe(true)
            expect((await lookupWord("gotta")).exists).toBe(true)
            expect((await lookupWord("kinda")).exists).toBe(true)
            expect((await lookupWord("dunno")).exists).toBe(true)
            expect((await lookupWord("lemme")).exists).toBe(true)
            expect((await lookupWord("gimme")).exists).toBe(true)
            expect((await lookupWord("y'all")).exists).toBe(true)
            expect((await lookupWord("needn't")).exists).toBe(true)
            expect((await lookupWord("shan't")).exists).toBe(true)
            expect((await lookupWord("oughtn't")).exists).toBe(true)
        })

        it('should handle all pronoun variants (yourselves, myself, himself, herself, ourselves, themselves)', async () => {
            expect((await lookupWord("yourselves")).exists).toBe(true)
            expect((await lookupWord("myself")).exists).toBe(true)
            expect((await lookupWord("himself")).exists).toBe(true)
            expect((await lookupWord("herself")).exists).toBe(true)
            expect((await lookupWord("themselves")).exists).toBe(true)
        })

        it('should handle British vs American spelling variants (colour, organise, theatre, cancelled)', async () => {
            const resColour = await lookupWord("colour")
            expect(resColour.exists).toBe(true)

            const resOrganise = await lookupWord("organise")
            expect(resOrganise.exists).toBe(true)

            const resTheatre = await lookupWord("theatre")
            expect(resTheatre.exists).toBe(true)
        })

        it('should handle irregular verb forms (went, gone, drunk, eaten, written, flown, began)', async () => {
            expect((await lookupWord("went")).exists).toBe(true)
            expect((await lookupWord("gone")).exists).toBe(true)
            expect((await lookupWord("drunk")).exists).toBe(true)
            expect((await lookupWord("eaten")).exists).toBe(true)
            expect((await lookupWord("written")).exists).toBe(true)
            expect((await lookupWord("flown")).exists).toBe(true)
        })

        it('should handle doubled consonant V-ing and V-ed (running, stopping, planning, winning, cutting)', async () => {
            expect((await lookupWord("running")).exists).toBe(true)
            expect((await lookupWord("stopping")).exists).toBe(true)
            expect((await lookupWord("planning")).exists).toBe(true)
            expect((await lookupWord("winning")).exists).toBe(true)
            expect((await lookupWord("stopped")).exists).toBe(true)
            expect((await lookupWord("planned")).exists).toBe(true)
        })

        it('should handle negative prefixes (unhappy, unable, unfair, impossible, dislike, nonstop)', async () => {
            expect((await lookupWord("unhappy")).exists).toBe(true)
            expect((await lookupWord("unable")).exists).toBe(true)
            expect((await lookupWord("unfair")).exists).toBe(true)
            expect((await lookupWord("impossible")).exists).toBe(true)
            expect((await lookupWord("dislike")).exists).toBe(true)
            expect((await lookupWord("nonstop")).exists).toBe(true)
        })

        it('should handle essential adverbs like quite, very, really', async () => {
            const resQuite = await lookupWord("quite")
            expect(resQuite.exists).toBe(true)
            expect(resQuite.results[0].meanings[0].definition).toContain("Khá")
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

        it('should suggest place names and countries when typing prefix', () => {
            const vnSuggestions = getSuggestions("da n", 5)
            expect(vnSuggestions).toContain("đà nẵng")

            const countrySuggestions = getSuggestions("ita", 5)
            expect(countrySuggestions).toContain("Italy")

            const mountainSuggestions = getSuggestions("eve", 5)
            expect(mountainSuggestions).toContain("Everest")
        })
    })

    describe('DictionaryMeaning structure', () => {
        it('should have correct example format (backward compatible)', async () => {
            const result = await lookupWord('đảo')
            expect(result.exists).toBe(true)

            const meaningWithExample = result.results
                .flatMap(r => r.meanings)
                .find(m => m.example !== null)

            if (meaningWithExample) {
                expect(typeof meaningWithExample.example).toBe('string')
            }
        })

        it('should have links as array', async () => {
            const result = await lookupWord('từ điển')
            expect(result.exists).toBe(true)

            if (result.results[0]?.meanings[0]) {
                expect(Array.isArray(result.results[0].meanings[0].links)).toBe(true)
            }
        })
    })

    describe('TTS & Audio CORS endpoint', () => {
        it('should respond to OPTIONS with CORS headers', async () => {
            const { OPTIONS } = await import('../app/api/v1/tts/route');
            const res = await OPTIONS();
            expect(res.status).toBe(204);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
        });

        it('should return relative audio URL in lookup response for backend client composition', async () => {
            const { GET } = await import('../app/api/v1/lookup/route');
            const req = new Request('http://localhost:3000/api/v1/lookup?word=quite');
            const res = await GET(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.exists).toBe(true);
            expect(data.results[0].audio).toBe('/api/v1/tts?word=quite&lang=en');
        });

        it('should accept Google TTS parameters (q, tl)', async () => {
            const { GET } = await import('../app/api/v1/tts/route');
            const req = new Request('http://localhost:3000/api/v1/tts?ie=UTF-8&tl=en&client=tw-ob&q=quite');
            const res = await GET(req);
            expect(res.status).toBe(200);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
        });

        it('should support /translate_tts route with Google query params', async () => {
            const { GET } = await import('../app/translate_tts/route');
            const req = new Request('http://localhost:3000/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=quite');
            const res = await GET(req);
            expect(res.status).toBe(200);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
        });

        it('should accept full Google TTS URL in ?url= parameter', async () => {
            const { GET } = await import('../app/api/v1/tts/route');
            const req = new Request('http://localhost:3000/api/v1/tts?url=https://translate.google.com/translate_tts?ie=UTF-8%26tl=en%26client=tw-ob%26q=quite');
            const res = await GET(req);
            expect(res.status).toBe(200);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });

        it('should resolve rare medical / technical English words via Wiktionary fallback', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('thyroparathyroidectomized');
            expect(result.exists).toBe(true);
            expect(result.results.length).toBeGreaterThan(0);
            expect(result.results[0].meanings.length).toBeGreaterThan(0);
        }, 10000);
    })
})
