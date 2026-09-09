import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range, User-Agent, X-Requested-With, Accept',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Access-Control-Max-Age': '86400',
};

export function middleware(request: NextRequest) {
    // Handle preflight OPTIONS requests for all API routes
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }

    const response = NextResponse.next();
    // Inject CORS headers into all outgoing API responses
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
        if (key !== 'Access-Control-Max-Age') {
            response.headers.set(key, value);
        }
    }

    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};
