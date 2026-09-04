import { Metadata } from 'next';
import { lookupWord } from '@/lib/dictionary';
import { encodeWordSlug, decodeWordSlug } from '@/lib/urlSlug';
import WordPageClient from './WordPageClient';

interface PageProps {
    params: Promise<{ word: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { word: encodedWord } = await params;
    const word = decodeWordSlug(encodedWord);
    const result = await lookupWord(word);

    // Get all meanings for rich description
    const meanings = result.exists && result.results?.[0]?.meanings || [];
    const totalMeanings = meanings.length;
    const firstMeaning = meanings[0];

    // Clean definition and remove trailing punctuation
    const rawDefinition = firstMeaning?.definition || 'Tra cứu nghĩa, cách dùng và ví dụ';
    const cleanDefinition = rawDefinition
        .replace(/["\n\r]/g, '')
        .replace(/[.。,，;；:：!！?？]+$/, '') // Remove trailing punctuation
        .slice(0, 120);

    // Build rich description with POS and count
    const pos = firstMeaning?.pos || '';
    const posPrefix = pos ? `(${pos}) ` : '';
    const countSuffix = totalMeanings > 1 ? `.\nXem thêm ${totalMeanings - 1} định nghĩa khác...` : '';

    // OG image description (shorter, for image)
    const ogImageDesc = `${posPrefix}${cleanDefinition}${countSuffix}`;

    // Full description for meta tags
    const fullDescription = `${word}: ${posPrefix}${cleanDefinition}${countSuffix}. Tra cứu nghĩa và ví dụ miễn phí với từ đồng nghĩa, phát âm của từ "${word}"`;

    return {
        title: `"${word}" là gì? Nghĩa của "${word}" | API Từ Điển Free minhqnd`,
        description: fullDescription,
        keywords: [
            `${word} nghĩa là gì`,
            `${word} là gì`,
            `nghĩa của từ ${word}`,
            `${word} tiếng việt`,
            `cách dùng ${word}`,
            `ví dụ ${word}`,
        ],
        openGraph: {
            title: `"${word}" là gì?, nghĩa của "${word}" | API Từ Điển Free minhqnd`,
            description: fullDescription,
            url: `https://dict.minhqnd.com/word/${encodeWordSlug(word)}`,
            siteName: 'dict.minhqnd.com',
            locale: 'vi_VN',
            type: 'article',
            images: [
                {
                    url: `https://minhqnd.com/api/og?title=${encodeURIComponent('"' + word + '" nghĩa là gì?')}&description=${encodeURIComponent(ogImageDesc)}&footer=${encodeURIComponent('API Từ Điển Đa Ngôn Ngữ Free | @minhqnd')}&brand=${encodeURIComponent('Từ điển API')}`,
                    width: 1200,
                    height: 630,
                    alt: `Nghĩa của từ ${word}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `"${word}" là gì? Nghĩa của "${word}"`,
            description: fullDescription,
        },
        alternates: {
            canonical: `https://dict.minhqnd.com/word/${encodeWordSlug(word)}`,
        },
    };
}

// Server component
export default async function WordPage({ params }: PageProps) {
    const { word: encodedWord } = await params;
    const word = decodeWordSlug(encodedWord);
    const result = await lookupWord(word);

    // Convert to client-compatible format
    const clientResult = {
        exists: result.exists,
        word: result.word,
        results: result.results,
    };

    // JSON-LD Schema for SEO
    const jsonLd = result.exists ? {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'name': word,
        'description': result.results?.[0]?.meanings?.[0]?.definition || '',
        'inDefinedTermSet': {
            '@type': 'DefinedTermSet',
            'name': 'API Từ Điển Tiếng Việt & Đa Ngôn Ngữ Miễn Phí | @minhqnd',
            'url': 'https://dict.minhqnd.com'
        }
    } : null;

    // Breadcrumb Schema
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Trang chủ',
                'item': 'https://dict.minhqnd.com'
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': word,
                'item': `https://dict.minhqnd.com/word/${encodeWordSlug(word)}`
            }
        ]
    };

    // FAQ Schema
    const faqJsonLd = result.exists ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `${word} nghĩa là gì?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${word} có nghĩa là: ${result.results?.[0]?.meanings?.[0]?.definition || 'một từ trong tiếng Việt.'}`
                }
            },
            {
                '@type': 'Question',
                'name': `Cách phát âm ${word}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': result.results?.[0]?.pronunciations?.[0]?.ipa
                        ? `Phiên âm IPA: /${result.results[0].pronunciations[0].ipa}/`
                        : `Nhấn vào nút phát âm để nghe cách phát âm ${word}.`
                }
            }
        ]
    } : null;

    return (
        <>
            {/* JSON-LD Schema */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}

            <WordPageClient word={word} initialResult={clientResult} />
        </>
    );
}
