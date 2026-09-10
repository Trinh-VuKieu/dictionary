import { NextResponse } from 'next/server';
import { lookupWord } from '../../../../lib/dictionary';

// Cache: 1 day fresh + 1 year stale-while-revalidate + CORS
const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
    'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range, User-Agent, X-Requested-With, Accept, Cache-Control, If-None-Match, If-Modified-Since',
    'Vary': 'Origin',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            ...CACHE_HEADERS,
            'Access-Control-Max-Age': '86400',
            'Content-Length': '0',
        },
    });
}

export async function HEAD(req: Request) {
    return GET(req);
}

/**
 * Multi-language dictionary lookup API
 * 
 * GET /api/v1/lookup?word=hello
 * GET /api/v1/lookup?word=hello&lang=vi  (specific word language)
 * GET /api/v1/lookup?word=hello&lang=vi&def_lang=en  (filter definitions by language)
 * 
 * @returns JSON response with results grouped by language
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let word = searchParams.get('word');
        if (word) {
            while (word.includes('%25') || word.includes('%27') || word.includes('%20')) {
                try {
                    const decoded = decodeURIComponent(word);
                    if (decoded === word) break;
                    word = decoded;
                } catch {
                    break;
                }
            }
        }
        const lang = searchParams.get('lang') || undefined;
        const defLang = searchParams.get('def_lang') || undefined;

        // Build log message - only include params that exist
        const logParts = [`[LOOKUP] ${word}`];
        if (lang) logParts.push(`lang:${lang}`);
        if (defLang) logParts.push(`def_lang:${defLang}`);
        console.log(logParts.join(' '));

        if (!word) {
            return NextResponse.json({ error: 'Missing "word" parameter' }, { status: 400, headers: CACHE_HEADERS });
        }

        const result = await lookupWord(word, lang);

        if (!result.exists || result.results.length === 0) {
            return NextResponse.json({ exists: false, word: result.word }, { status: 404, headers: CACHE_HEADERS });
        }

        // Filter meanings by definition language if def_lang is specified
        if (defLang) {
            const filteredResults = result.results.map(langResult => ({
                ...langResult,
                meanings: langResult.meanings.filter(m => m.definition_lang === defLang)
            })).filter(langResult => langResult.meanings.length > 0);

            if (filteredResults.length === 0) {
                return NextResponse.json({ exists: false, word: result.word }, { status: 404, headers: CACHE_HEADERS });
            }

            return NextResponse.json({
                ...result,
                results: filteredResults
            }, { status: 200, headers: CACHE_HEADERS });
        }

        const format = searchParams.get('format') || undefined;

        // Support direct DictionaryWord format for Java backend
        if (format === 'model' || format === 'edu' || format === 'dictionary_word') {
            const primary = result.results[0];
            const cleanWord = result.word;
            let rootWord = result.rootWord ?? primary?.rootWord ?? null;
            if (rootWord && rootWord.trim().toLowerCase() === cleanWord.trim().toLowerCase()) {
                rootWord = null;
            }
            return NextResponse.json({
                id: null,
                word: cleanWord,
                rootWord: rootWord,
                phonetics: result.phonetics || primary?.phonetics || [],
                meanings: result.meaning_groups || primary?.meaning_groups || []
            }, { status: 200, headers: CACHE_HEADERS });
        }

        return NextResponse.json(result, { status: 200, headers: CACHE_HEADERS });
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[LOOKUP 500 ERROR]:', err);
        return NextResponse.json({
            error: 'Internal server error',
            message: errorMsg
        }, { status: 500, headers: CACHE_HEADERS });
    }
}
