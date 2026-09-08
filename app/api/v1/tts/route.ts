import { NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Range, User-Agent, Authorization',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Accept-Ranges': 'bytes',
};

// In-memory audio buffer cache (stores up to 500 audio files in memory)
export const AUDIO_CACHE = new Map<string, ArrayBuffer>();
const MAX_AUDIO_CACHE_SIZE = 500;

// Upstream Google TTS endpoints for high availability
const TTS_ENDPOINTS = [
    (q: string, tl: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(tl)}&client=tw-ob`,
    (q: string, tl: string) => `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(q)}`,
    (q: string, tl: string) => `https://translate.google.com/translate_tts?client=dict-chrome-ex&ie=UTF-8&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(q)}`,
];

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            ...CORS_HEADERS,
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function HEAD(req: Request) {
    return GET(req);
}

/**
 * DELETE /api/v1/tts?word=...&lang=...
 * Purges specified audio or all audio from the in-memory cache
 */
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word') || searchParams.get('q');
    const lang = searchParams.get('lang') || searchParams.get('tl');

    if (word) {
        const cleanWord = word.toLowerCase().trim();
        if (lang) {
            const key = `${cleanWord}:${lang.toLowerCase().trim()}`;
            const deleted = AUDIO_CACHE.delete(key);
            return NextResponse.json({ success: true, deletedKey: key, deleted }, { headers: CORS_HEADERS });
        } else {
            let count = 0;
            for (const key of Array.from(AUDIO_CACHE.keys())) {
                if (key.startsWith(`${cleanWord}:`)) {
                    AUDIO_CACHE.delete(key);
                    count++;
                }
            }
            return NextResponse.json({ success: true, deletedWord: cleanWord, count }, { headers: CORS_HEADERS });
        }
    }

    const count = AUDIO_CACHE.size;
    AUDIO_CACHE.clear();
    return NextResponse.json({ success: true, message: 'Audio cache cleared', count }, { headers: CORS_HEADERS });
}

/**
 * API route: GET /api/v1/tts?word=...&lang=...
 * Proxies requests to Google Translate TTS with full CORS support
 * Strictly stays within the target language family (never cross-falls back from English to Vietnamese or vice versa)
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    
    // Support standard params (word, lang) and Google TTS params (q, tl, text)
    let word = searchParams.get('word') || searchParams.get('q') || searchParams.get('text');
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
    let lang = searchParams.get('lang') || searchParams.get('tl') || 'en';

    // Support passing full Google TTS URL via ?url=...
    const rawUrl = searchParams.get('url');
    if (rawUrl) {
        try {
            const parsed = new URL(rawUrl);
            word = parsed.searchParams.get('q') || parsed.searchParams.get('word') || word;
            lang = parsed.searchParams.get('tl') || parsed.searchParams.get('lang') || lang;
        } catch {
            // ignore invalid URL
        }
    }

    if (!word) {
        return NextResponse.json(
            { error: 'Missing "word" or "q" parameter' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    const cleanWord = word.trim();
    const cleanLang = lang.trim().toLowerCase();
    const cacheKey = `${cleanWord.toLowerCase()}:${cleanLang}`;

    const forceReload = searchParams.get('reload') === 'true' || 
                        searchParams.get('reload') === '1' || 
                        searchParams.get('fresh') === 'true' || 
                        searchParams.get('nocache') === 'true';

    if (!forceReload && AUDIO_CACHE.has(cacheKey)) {
        const cachedBuffer = AUDIO_CACHE.get(cacheKey)!;
        return new NextResponse(cachedBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
                ...CORS_HEADERS,
            },
        });
    }

    // STRICT language resolution: Only allow dialect fallback (e.g. en-US -> en, vi-VN -> vi)
    // NEVER allow cross-language fallbacks (e.g. en -> vi), which corrupts pronunciation
    const langsToTry: string[] = [cleanLang];
    if (cleanLang.includes('-')) {
        const baseLang = cleanLang.split('-')[0];
        if (baseLang && !langsToTry.includes(baseLang)) {
            langsToTry.push(baseLang);
        }
    } else if (cleanLang === 'en') {
        langsToTry.push('en-US');
    }

    for (const tryLang of langsToTry) {
        for (const endpointGen of TTS_ENDPOINTS) {
            try {
                const ttsUrl = endpointGen(cleanWord, tryLang);

                const response = await fetch(ttsUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    signal: AbortSignal.timeout(6000)
                });

                if (response.ok) {
                    const audioBuffer = await response.arrayBuffer();
                    if (audioBuffer && audioBuffer.byteLength > 0) {
                        if (AUDIO_CACHE.size >= MAX_AUDIO_CACHE_SIZE) {
                            const oldestKey = AUDIO_CACHE.keys().next().value;
                            if (oldestKey) AUDIO_CACHE.delete(oldestKey);
                        }
                        AUDIO_CACHE.set(cacheKey, audioBuffer);

                        console.log(`[TTS] "${cleanWord}" lang=${tryLang}${tryLang !== cleanLang ? ` (dialect fallback from ${cleanLang})` : ''}`);
                        return new NextResponse(audioBuffer, {
                            headers: {
                                'Content-Type': 'audio/mpeg',
                                'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
                                ...CORS_HEADERS,
                            },
                        });
                    }
                }
            } catch {
                // Continue to next endpoint or language dialect
            }
        }
    }

    console.log(`[TTS] FAIL "${cleanWord}" lang=${cleanLang}`);
    return NextResponse.json(
        { error: `Failed to generate speech for language "${cleanLang}"` },
        { status: 500, headers: CORS_HEADERS }
    );
}
