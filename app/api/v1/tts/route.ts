import { NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Range, User-Agent, Authorization',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Accept-Ranges': 'bytes',
};

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
 * API route: GET /api/v1/tts?word=...&lang=...
 * Proxies requests to Google Translate TTS with full CORS support
 * Falls back to English then Vietnamese if specified language is not supported
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    
    // Support standard params (word, lang) and Google TTS params (q, tl, text)
    let word = searchParams.get('word') || searchParams.get('q') || searchParams.get('text');
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

    // Try languages in order: specified lang -> English -> Vietnamese
    const langsToTry = [lang];
    if (lang !== 'en') langsToTry.push('en');
    if (lang !== 'vi') langsToTry.push('vi');

    for (const tryLang of langsToTry) {
        try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=${tryLang}&client=tw-ob`;

            const response = await fetch(ttsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.ok) {
                const audioBuffer = await response.arrayBuffer();
                console.log(`[TTS] "${word}" lang=${tryLang}${tryLang !== lang ? ` (fallback from ${lang})` : ''}`);
                return new NextResponse(audioBuffer, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        ...CORS_HEADERS,
                    },
                });
            }
        } catch {
            // Continue to next language
        }
    }

    console.log(`[TTS] FAIL "${word}" lang=${lang}`);
    return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: 500, headers: CORS_HEADERS }
    );
}
