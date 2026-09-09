import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/dictionary';

// Cache: 1 day fresh + 1 year stale-while-revalidate + CORS
const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
    'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            ...CACHE_HEADERS,
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const langParam = searchParams.get('lang') || undefined;

    // Build log message - only include params that exist
    const logParts = [`[SUGGEST] ${q}`];
    if (limitParam) logParts.push(`limit:${limitParam}`);
    if (langParam) logParts.push(`lang:${langParam}`);
    console.log(logParts.join(' '));

    if (!q || q.length < 1) {
        return NextResponse.json({ suggestions: [] }, { headers: CACHE_HEADERS });
    }

    // Parse limit: default 5, min 1, max 20
    let limit = 5;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (!isNaN(parsed)) {
            limit = Math.max(1, Math.min(20, parsed));
        }
    }

    const suggestions = getSuggestions(q, limit, langParam);
    return NextResponse.json({ suggestions }, { headers: CACHE_HEADERS });
}
