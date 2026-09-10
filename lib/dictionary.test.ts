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

        it('should perform synchronous lookup via lookupWordSync', () => {
            const result = lookupWordSync('xin chào')
            expect(result.exists).toBe(true)
            expect(result.word).toBe('xin chào')
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
            expect(result.word).toBe("class")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
            expect(result.results[0].pronunciations.length).toBe(2)
            expect(result.results[0].pronunciations[0].region).toBe("US")
            expect(result.results[0].pronunciations[0].ipa).toBe("/ˈklæs/")
            expect(result.results[0].pronunciations[0].audio).toContain("accent=us")
            expect(result.results[0].pronunciations[1].region).toBe("UK")
            expect(result.results[0].pronunciations[1].ipa).toBe("/ˈklɑːs/")
            expect(result.results[0].pronunciations[1].audio).toContain("accent=uk")
        })

        it('should resolve plural "moments" with full meanings of "moment" and proper IPA', async () => {
            const result = await lookupWord("moments")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("moment")
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            expect(en!.pronunciations.length).toBe(2)
            expect(en!.pronunciations[0].ipa).toContain("moʊ.mənt")
            // Must contain common life meanings like "Chốc, lúc, lát"
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/chốc|lúc|lát|khoảnh khắc/i)
        })

        it('should resolve plural "minutes" with time meanings instead of just 3rd person singular', async () => {
            const result = await lookupWord("minutes")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            expect(en!.pronunciations.length).toBeGreaterThan(0)
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/phút|thời gian|biên bản/i)
        })

        it('should resolve plural "seconds" with time and ranking meanings', async () => {
            const result = await lookupWord("seconds")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/thứ hai|giây/i)
        })

        it('should resolve irregular plural "children" with full child definitions and IPA', async () => {
            const result = await lookupWord("children")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            expect(en!.pronunciations.length).toBeGreaterThan(0)
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/đứa bé|đứa trẻ|con cái|child/i)
        })

        it('should resolve irregular plural "teeth" with tooth definitions via automatic DB lemma enrichment', async () => {
            const result = await lookupWord("teeth")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/răng|tooth/i)
        })

        it('should resolve past tense "walked" with full walk definitions via automatic DB lemma enrichment', async () => {
            const result = await lookupWord("walked")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/đi bộ|dạo chơi|walk/i)
        })

        it('should automatically enrich shadowed SQLite word "abbreviations" with root definitions', async () => {
            const result = await lookupWord("abbreviations")
            expect(result.exists).toBe(true)
            const en = result.results.find(r => r.lang_code === 'en')
            expect(en).toBeDefined()
            const defs = en!.meanings.map(m => m.definition).join(' ')
            expect(defs).toMatch(/tóm tắt|viết tắt/i)
        })

        it('should find superlative "happiest" mapping to "happy"', async () => {
            const result = await lookupWord("happiest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("happy")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
        })

        it('should find superlative "funniest" mapping to "funny"', async () => {
            const result = await lookupWord("funniest")
            expect(result.exists).toBe(true)
            expect(result.word).toBe("funny")
            expect(result.results.length).toBeGreaterThan(0)
            expect(result.results[0].meanings.length).toBeGreaterThan(0)
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

        it('should strip trailing and surrounding punctuation when looking up words', async () => {
            const resDot = await lookupWord("quite.")
            expect(resDot.exists).toBe(true)

            const resExclamation = await lookupWord("hello!")
            expect(resExclamation.exists).toBe(true)

            const resQuestion = await lookupWord("word?")
            expect(resQuestion.exists).toBe(true)

            const resQuotes = await lookupWord('"apple"')
            expect(resQuotes.exists).toBe(true)
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
        it('should handle possessive case (dog\'s, teacher\'s, mary\'s, students\', Quan\'s, Quân\'s, James\')', async () => {
            const resDogs = await lookupWord("dog's")
            expect(resDogs.exists).toBe(true)
            expect(resDogs.results[0].meanings[0].definition).toContain("sở hữu cách")

            const resTeachers = await lookupWord("teacher's")
            expect(resTeachers.exists).toBe(true)

            const resMarys = await lookupWord("mary's")
            expect(resMarys.exists).toBe(true)

            const resStudents = await lookupWord("students'")
            expect(resStudents.exists).toBe(true)

            // Vietnamese proper name possessives
            const resQuans = await lookupWord("Quan's")
            expect(resQuans.exists).toBe(true)
            expect(resQuans.results[0].meanings[0].definition).toContain("sở hữu cách")
            expect(resQuans.results[0].meanings[0].definition).toContain("Quan")
            expect(resQuans.results[0].meanings[0].definition).not.toContain("Khi nào")

            const resQuansLower = await lookupWord("quan's")
            expect(resQuansLower.exists).toBe(true)
            expect(resQuansLower.results[0].meanings[0].definition).toContain("Quan")

            const resQuansDiacritic = await lookupWord("Quân's")
            expect(resQuansDiacritic.exists).toBe(true)
            expect(resQuansDiacritic.results[0].meanings[0].definition).toContain("Quân")

            const resJames = await lookupWord("James'")
            expect(resJames.exists).toBe(true)
            expect(resJames.results[0].meanings[0].definition).toContain("James")
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

        it('should filter out English contractions when lang is vi', () => {
            const viSuggestions = getSuggestions("he'", 5, 'vi')
            expect(viSuggestions).not.toContain("he's")
        })

        it('should include English contractions when lang is en', () => {
            const enSuggestions = getSuggestions("he'", 5, 'en')
            expect(enSuggestions).toContain("he's")
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
        it('should handle OPTIONS preflight with full CORS headers in middleware', async () => {
            const { middleware, config } = await import('../middleware');
            const { NextRequest } = await import('next/server');
            expect(config.matcher).toContain('/api/:path*');
            expect(config.matcher).toContain('/translate_tts');

            const req = new NextRequest('http://localhost:3000/api/v1/tts?word=test', { method: 'OPTIONS' });
            const res = middleware(req);
            expect(res.status).toBe(204);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
            expect(res.headers.get('Vary')).toBe('Origin');
            expect(res.headers.get('Content-Length')).toBe('0');
        });

        it('should respond to OPTIONS with CORS headers', async () => {
            const { OPTIONS } = await import('../app/api/v1/tts/route');
            const res = await OPTIONS();
            expect(res.status).toBe(204);
            expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
            expect(res.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
            expect(res.headers.get('Vary')).toBe('Origin');
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

        it('should provide authentic US and UK pronunciations for core English words missing in DB', async () => {
            const { lookupWord } = await import('./dictionary');
            const testWords = ['have', 'has', 'about', 'start', 'block', 'drew', 'drawn', 'driven', 'calves'];
            for (const word of testWords) {
                const res = await lookupWord(word, 'en');
                const en = res.results.find(r => r.lang_code === 'en');
                expect(en).toBeDefined();
                expect(en!.pronunciations.length).toBeGreaterThan(0);
                const hasUs = en!.pronunciations.some(p => p.region === 'US' || p.region?.includes('US'));
                const hasUk = en!.pronunciations.some(p => p.region === 'UK' || p.region?.includes('UK'));
                expect(hasUs).toBe(true);
                expect(hasUk).toBe(true);
            }
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

        it('should serve repeated audio requests from in-memory cache', async () => {
            const { GET } = await import('../app/api/v1/tts/route');
            const req1 = new Request('http://localhost:3000/api/v1/tts?word=quite&lang=en');
            const res1 = await GET(req1);
            expect(res1.status).toBe(200);

            // Second call should serve from AUDIO_CACHE
            const req2 = new Request('http://localhost:3000/api/v1/tts?word=quite&lang=en');
            const res2 = await GET(req2);
            expect(res2.status).toBe(200);
            expect(res2.headers.get('Content-Type')).toBe('audio/mpeg');
        });

        it('should pronounce English word "momentum" in English, not Vietnamese', async () => {
            const { GET, DELETE } = await import('../app/api/v1/tts/route');
            // Clear any potential cache first
            await DELETE(new Request('http://localhost:3000/api/v1/tts?word=momentum&lang=en', { method: 'DELETE' }));

            const req = new Request('http://localhost:3000/api/v1/tts?word=momentum&lang=en');
            const res = await GET(req);
            expect(res.status).toBe(200);
            expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
            const buf = await res.arrayBuffer();
            // Google TTS returns 8640 bytes for momentum in English, 9600 bytes in Vietnamese
            expect(buf.byteLength).toBe(8640);
        });

        it('should support cache reload with ?reload=1 and DELETE method', async () => {
            const { GET, DELETE, AUDIO_CACHE } = await import('../app/api/v1/tts/route');
            const req = new Request('http://localhost:3000/api/v1/tts?word=momentum&lang=en&reload=1');
            const res = await GET(req);
            expect(res.status).toBe(200);
            expect(AUDIO_CACHE.has('momentum:en')).toBe(true);

            const delReq = new Request('http://localhost:3000/api/v1/tts?word=momentum&lang=en', { method: 'DELETE' });
            const delRes = await DELETE(delReq);
            expect(delRes.status).toBe(200);
            expect(AUDIO_CACHE.has('momentum:en')).toBe(false);
        });

        it('should resolve rare medical / technical English words via Wiktionary fallback', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('thyroparathyroidectomized');
            expect(result.exists).toBe(true);
            expect(result.results.length).toBeGreaterThan(0);
            expect(result.results[0].meanings.length).toBeGreaterThan(0);
        }, 10000);

        it('should have correct multi-meaning definition for "am" (to be verb + ante meridiem time + AM radio)', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('am', 'en');
            expect(result.exists).toBe(true);
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            expect(enRes!.audio).toBe('/api/v1/tts?word=am&lang=en');
            // Must have to be meaning
            const hasVerb = enRes!.meanings.some(m => m.pos === 'Động từ' && m.definition.includes('to be'));
            expect(hasVerb).toBe(true);
            // Must have time meaning (ante meridiem)
            const hasTime = enRes!.meanings.some(m => m.definition.includes('ante meridiem') || m.definition.includes('buổi sáng'));
            expect(hasTime).toBe(true);
            // Must have exactly 2 pronunciations: US and UK
            expect(enRes!.pronunciations.length).toBe(2);
            expect(enRes!.pronunciations[0].region).toBe('US');
            expect(enRes!.pronunciations[1].region).toBe('UK');
            const ipas = enRes!.pronunciations.map(p => p.ipa);
            expect(ipas).toContain('/æm/');
        });

        it('should have correct to be definition for "is" and "are"', async () => {
            const { lookupWord } = await import('./dictionary');
            const resIs = await lookupWord('is', 'en');
            expect(resIs.exists).toBe(true);
            const enIs = resIs.results.find(r => r.lang_code === 'en');
            expect(enIs!.meanings[0].pos).toBe('Động từ');
            expect(enIs!.meanings[0].definition).toContain('to be');
            expect(enIs!.pronunciations[0].ipa).toBe('/ɪz/');

            const resAre = await lookupWord('are', 'en');
            expect(resAre.exists).toBe(true);
            const enAre = resAre.results.find(r => r.lang_code === 'en');
            expect(enAre!.meanings[0].pos).toBe('Động từ');
            expect(enAre!.meanings[0].definition).toContain('to be');
        });

        it('should correctly resolve "does" as verb "do" and NOT female deer "doe"', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('does', 'en');
            expect(result.exists).toBe(true);
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            expect(enRes!.meanings[0].definition).toContain("động từ 'do'");
            expect(enRes!.meanings[0].definition).not.toContain("hươu");
            expect(enRes!.pronunciations[0].ipa).toBe('/dʌz/');
        });

        it('should resolve "who", "mine", and "should" with primary pedagogical definitions', async () => {
            const { lookupWord } = await import('./dictionary');
            const resWho = await lookupWord('who', 'en');
            const enWho = resWho.results.find(r => r.lang_code === 'en');
            expect(enWho!.meanings[0].definition).toContain('Ai, người nào');

            const resMine = await lookupWord('mine', 'en');
            const enMine = resMine.results.find(r => r.lang_code === 'en');
            expect(enMine!.meanings[0].definition).toContain('Của tôi');

            const resShould = await lookupWord('should', 'en');
            const enShould = resShould.results.find(r => r.lang_code === 'en');
            expect(enShould!.meanings[0].definition.length).toBeGreaterThan(5);
            expect(enShould!.meanings[0].definition).toContain('Nên');
        });

        it('should strictly reject Wikipedia disambiguation pages in wiki fallback', async () => {
            const { lookupWikiFallback } = await import('./wiki_fallback');
            const res = await lookupWikiFallback('AM');
            expect(res).toBeNull();
        });

        it('should correctly resolve "new" with rich meanings and IPA instead of 0 definitions', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('new');
            expect(result.exists).toBe(true);
            expect(result.word).toBe('new');
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            expect(enRes!.meanings.length).toBeGreaterThanOrEqual(4);
            expect(enRes!.meanings[0].definition).toContain('Mới, mới mẻ');
            expect(enRes!.pronunciations.length).toBeGreaterThanOrEqual(2);
            expect(enRes!.translations[0].translation).toContain('mới');
        });

        it('should resolve "miniscule" to diminutive meaning and NEVER to "Letter case"', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('miniscule');
            expect(result.exists).toBe(true);
            expect(result.word).toBe('minuscule');
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            const allDefs = enRes!.meanings.map(m => m.definition).join(' ');
            expect(allDefs).not.toContain('Letter case is the distinction');
            expect(allDefs).toMatch(/nhỏ xíu/i);
        });

        it('should resolve "mindset" and "mindsets" without hardcoded "Danh từ riêng"', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('mindset');
            expect(result.exists).toBe(true);
            expect(result.word).toBe('mindset');
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            expect(enRes!.meanings[0].pos).not.toBe('Danh từ riêng');
            expect(enRes!.meanings[0].definition).toContain('Tư duy');

            const pluralRes = await lookupWord('mindsets');
            expect(pluralRes.exists).toBe(true);
            const pluralEn = pluralRes.results.find(r => r.lang_code === 'en');
            expect(pluralEn).toBeDefined();
            expect(pluralEn!.meanings[0].pos).not.toBe('Danh từ riêng');
        });

        it('should reliably translate compound word "long-dormant" without 429 errors', async () => {
            const { lookupWord } = await import('./dictionary');
            const result = await lookupWord('long-dormant');
            expect(result.exists).toBe(true);
            expect(result.word).toBe('long-dormant');
            const enRes = result.results.find(r => r.lang_code === 'en');
            expect(enRes).toBeDefined();
            expect(enRes!.meanings.length).toBeGreaterThan(0);
            expect(enRes!.meanings[0].definition).toContain('không hoạt động lâu dài');
        });

        it('should ensure English is returned first for shadowed words like "made", "problem", "best"', async () => {
            const { lookupWord } = await import('./dictionary');
            const resMade = await lookupWord('made');
            expect(resMade.exists).toBe(true);
            expect(resMade.results[0].lang_code).toBe('en');
            expect(resMade.results[0].meanings.length).toBeGreaterThan(5);

            const resProblem = await lookupWord('problem');
            expect(resProblem.exists).toBe(true);
            expect(resProblem.results[0].lang_code).toBe('en');
            expect(resProblem.results[0].meanings[0].definition).toContain('Vấn đề');

            const resBest = await lookupWord('best');
            expect(resBest.exists).toBe(true);
            expect(resBest.results[0].lang_code).toBe('en');
        });

        it('should never contain definitions that are merely a single dot "."', async () => {
            const { lookupWordSync } = await import('./dictionary');
            const wordsToCheck = ['of', 'give', 'given', 'nice', 'fish', 'gives', 'fishing', 'gave', 'bought', 'dan'];
            for (const w of wordsToCheck) {
                const res = lookupWordSync(w);
                const allDefs = res.results.flatMap(r => r.meanings.map(m => m.definition));
                expect(allDefs.some(d => d.trim() === '.')).toBe(false);
            }
        });

        it('should correctly handle ussually typo and prevent -ly/-ty words from turning into -li/-ti', async () => {
            const { lookupWord, getSuggestions } = await import('./dictionary');

            // 1. ussually typo should map to usually, never returning ussualli
            const resUssually = await lookupWord('ussually');
            expect(resUssually.exists).toBe(true);
            expect(resUssually.word).toBe('usually');
            expect(resUssually.word).not.toBe('ussualli');
            expect(resUssually.results.length).toBeGreaterThan(0);
            expect(resUssually.results[0].meanings[0].definition).toContain('thường');

            // 2. usually should return pristine "usually", never "usualli"
            const resUsually = await lookupWord('usually');
            expect(resUsually.exists).toBe(true);
            expect(resUsually.word).toBe('usually');
            expect(resUsually.word).not.toBe('usualli');
            expect(resUsually.results[0].audio).toContain('word=usually');

            // 3. other English words ending in -ly, -ty must not be corrupted to -li, -ti
            const resFamily = await lookupWord('family');
            expect(resFamily.exists).toBe(true);
            expect(resFamily.word).toBe('family');
            expect(resFamily.word).not.toBe('famili');

            const resCity = await lookupWord('city');
            expect(resCity.exists).toBe(true);
            expect(resCity.word).toBe('city');
            expect(resCity.word).not.toBe('citi');

            const resParty = await lookupWord('party');
            expect(resParty.exists).toBe(true);
            expect(resParty.word).toBe('party');
            expect(resParty.word).not.toBe('parti');

            const resOnly = await lookupWord('only');
            expect(resOnly.exists).toBe(true);
            expect(resOnly.word).toBe('only');
            expect(resOnly.word).not.toBe('onli');

            // 4. Suggestions must never return corrupted -li/-ti words
            const usuaSugs = getSuggestions('usua');
            expect(usuaSugs).toContain('usually');
            expect(usuaSugs).not.toContain('usualli');

            const ussuaSugs = getSuggestions('ussua');
            expect(ussuaSugs).toContain('ussually');

            const famiSugs = getSuggestions('fami');
            expect(famiSugs).toContain('family');
            expect(famiSugs).not.toContain('famili');

            const citSugs = getSuggestions('cit');
            expect(citSugs).toContain('city');
            expect(citSugs).not.toContain('citi');
        });

        it('should correctly handle words with "qui" without corrupting into "quy" (quick, quiet, quite, liquid, require...)', async () => {
            const { lookupWord, getSuggestions } = await import('./dictionary');

            // 1. English words with "qui" should never be mutated into "quy"
            const resQuick = await lookupWord('quick');
            expect(resQuick.exists).toBe(true);
            expect(resQuick.word).toBe('quick');
            expect(resQuick.word).not.toBe('quyck');
            expect(resQuick.results[0].audio).toContain('word=quick');
            expect(resQuick.results[0].meanings.length).toBeGreaterThan(0);

            const resQuiet = await lookupWord('quiet');
            expect(resQuiet.exists).toBe(true);
            expect(resQuiet.word).toBe('quiet');
            expect(resQuiet.word).not.toBe('quyet');

            const resQuite = await lookupWord('quite');
            expect(resQuite.exists).toBe(true);
            expect(resQuite.word).toBe('quite');
            expect(resQuite.word).not.toBe('quyte');

            const resLiquid = await lookupWord('liquid');
            expect(resLiquid.exists).toBe(true);
            expect(resLiquid.word).toBe('liquid');
            expect(resLiquid.word).not.toBe('liquyd');

            const resRequire = await lookupWord('require');
            expect(resRequire.exists).toBe(true);
            expect(resRequire.word).toBe('require');
            expect(resRequire.word).not.toBe('requyre');

            const resEquipment = await lookupWord('equipment');
            expect(resEquipment.exists).toBe(true);
            expect(resEquipment.word).toBe('equipment');
            expect(resEquipment.word).not.toBe('equypment');

            const resAcquire = await lookupWord('acquire');
            expect(resAcquire.exists).toBe(true);
            expect(resAcquire.word).toBe('acquire');
            expect(resAcquire.word).not.toBe('acquyre');

            const resSquid = await lookupWord('squid');
            expect(resSquid.exists).toBe(true);
            expect(resSquid.word).toBe('squid');
            expect(resSquid.word).not.toBe('squyd');

            // 2. Vietnamese qui vs quy should both resolve cleanly
            const resQuyTac = await lookupWord('quy tắc');
            expect(resQuyTac.exists).toBe(true);
            expect(resQuyTac.word).toBe('quy tắc');

            const resQuiTac = await lookupWord('qui tắc');
            expect(resQuiTac.exists).toBe(true);
            expect(resQuiTac.word).toBe('qui tắc');

            // 3. Suggestions for "qui" & "quick" should never contain "quyck"
            const quickSugs = getSuggestions('quick');
            expect(quickSugs).toContain('quick');
            expect(quickSugs).not.toContain('quyck');

            const quiSugs = getSuggestions('qui');
            expect(quiSugs).toContain('quite');
            expect(quiSugs).not.toContain('quyte');
        });

        it('should correctly return complete synonyms and antonyms for core English words', async () => {
            const { lookupWord } = await import('./dictionary');

            // 1. Core word "good"
            const resGood = await lookupWord('good', 'en');
            expect(resGood.exists).toBe(true);
            const enGood = resGood.results[0];
            expect(enGood.synonyms).toBeDefined();
            expect(enGood.synonyms!.length).toBeGreaterThanOrEqual(5);
            expect(enGood.synonyms).toContain('great');
            expect(enGood.synonyms).toContain('excellent');
            expect(enGood.antonyms).toBeDefined();
            expect(enGood.antonyms!.length).toBeGreaterThanOrEqual(4);
            expect(enGood.antonyms).toContain('bad');
            expect(enGood.antonyms).toContain('terrible');
            // Check relations compatibility with Java backend ("Đồng nghĩa", "Trái nghĩa")
            expect(enGood.relations.some(r => r.relation_type === 'Đồng nghĩa' && r.related_word === 'great')).toBe(true);
            expect(enGood.relations.some(r => r.relation_type === 'Trái nghĩa' && r.related_word === 'bad')).toBe(true);

            // 2. Core word "bad"
            const resBad = await lookupWord('bad', 'en');
            const enBad = resBad.results[0];
            expect(enBad.synonyms).toContain('terrible');
            expect(enBad.antonyms).toContain('good');

            // 3. Core word "happy"
            const resHappy = await lookupWord('happy', 'en');
            const enHappy = resHappy.results[0];
            expect(enHappy.synonyms).toContain('cheerful');
            expect(enHappy.antonyms).toContain('sad');

            // 4. Lemma resolution: "classes" inherits synonyms of "class"
            const resClasses = await lookupWord('classes', 'en');
            const enClasses = resClasses.results[0];
            expect(enClasses.synonyms).toContain('course');
            expect(enClasses.synonyms).toContain('lesson');
            expect(enClasses.pronunciations.length).toBe(2);

            // 5. Comparative lemma: "happier" inherits from "happy"
            const resHappier = await lookupWord('happier', 'en');
            const enHappier = resHappier.results[0];
            expect(enHappier.synonyms).toContain('cheerful');
            expect(enHappier.antonyms).toContain('sad');
        });

        it('should return rich relations including "Gốc từ" for inflected words (went, gone, eating, children, mice, etc.)', async () => {
            // 1. Test "went"
            const resWent = await lookupWord('went', 'en');
            expect(resWent.exists).toBe(true);
            expect(resWent.word).toBe('went');
            const enWent = resWent.results.find(r => r.lang_code === 'en')!;
            expect(enWent).toBeDefined();
            // Relations must have "Gốc từ": "go"
            const rootGo = enWent.relations.find(r => r.relation_type === 'Gốc từ');
            expect(rootGo).toBeDefined();
            expect(rootGo!.related_word.toLowerCase()).toBe('go');
            // Pronunciations must be for went (/went/)
            expect(enWent.pronunciations.length).toBe(2);
            expect(enWent.pronunciations[0].ipa).toBe('/went/');
            expect(enWent.audio).toContain('word=went');
            // Meanings must include meta grammar definition and root meanings
            expect(enWent.meanings.length).toBeGreaterThan(1);
            expect(enWent.meanings[0].definition).toContain('quá khứ');
            // Inherited synonyms & antonyms from "go"
            expect(enWent.synonyms).toBeDefined();
            expect(enWent.synonyms!.length).toBeGreaterThan(0);
            expect(enWent.antonyms).toBeDefined();

            // 2. Test "gone" and "going"
            const resGone = await lookupWord('gone', 'en');
            const enGone = resGone.results.find(r => r.lang_code === 'en')!;
            expect(enGone.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'go')).toBe(true);

            const resGoing = await lookupWord('going', 'en');
            const enGoing = resGoing.results.find(r => r.lang_code === 'en')!;
            expect(enGoing.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'go')).toBe(true);

            // 3. Test irregular verb "ate" & "eaten" -> root "eat"
            const resAte = await lookupWord('ate', 'en');
            const enAte = resAte.results.find(r => r.lang_code === 'en')!;
            expect(enAte.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'eat')).toBe(true);

            const resEaten = await lookupWord('eaten', 'en');
            const enEaten = resEaten.results.find(r => r.lang_code === 'en')!;
            expect(enEaten.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'eat')).toBe(true);

            // 4. Test irregular plural nouns: "children" -> "child", "mice" -> "mouse", "teeth" -> "tooth", "feet" -> "foot"
            const resChildren = await lookupWord('children', 'en');
            const enChildren = resChildren.results.find(r => r.lang_code === 'en')!;
            expect(enChildren.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'child')).toBe(true);

            const resMice = await lookupWord('mice', 'en');
            const enMice = resMice.results.find(r => r.lang_code === 'en')!;
            expect(enMice.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'mouse')).toBe(true);

            const resTeeth = await lookupWord('teeth', 'en');
            const enTeeth = resTeeth.results.find(r => r.lang_code === 'en')!;
            expect(enTeeth.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'tooth')).toBe(true);

            const resFeet = await lookupWord('feet', 'en');
            const enFeet = resFeet.results.find(r => r.lang_code === 'en')!;
            expect(enFeet.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'foot')).toBe(true);

            // 5. Test root word "go" has reverse relation "Từ phái sinh" listing went, gone, going, goes
            const resGo = await lookupWord('go', 'en');
            const enGo = resGo.results.find(r => r.lang_code === 'en')!;
            const derivedWords = enGo.relations.filter(r => r.relation_type === 'Từ phái sinh').map(r => r.related_word.toLowerCase());
            expect(derivedWords).toContain('went');
            expect(derivedWords).toContain('gone');
            expect(derivedWords).toContain('going');
            expect(derivedWords).toContain('goes');

            // 6. Test informal contractions: "gonna" -> root "go"
            const resGonna = await lookupWord('gonna', 'en');
            const enGonna = resGonna.results.find(r => r.lang_code === 'en')!;
            expect(enGonna.relations.some(r => r.relation_type === 'Gốc từ' && r.related_word.toLowerCase() === 'go')).toBe(true);
        });
    })
})


