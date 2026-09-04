import { LanguageResult } from './dictionary';

// ==========================================
// 1. NUMBER TO WORDS (ENGLISH & VIETNAMESE)
// ==========================================

const ONES_EN = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_EN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES_EN = ['', 'thousand', 'million', 'billion', 'trillion'];

const DIGITS_VI = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

export function integerToEnglish(n: number): string {
    if (n === 0) return 'zero';
    const isNeg = n < 0;
    let absN = Math.abs(n);
    const parts: string[] = [];
    let scaleIdx = 0;

    while (absN > 0 && scaleIdx < SCALES_EN.length) {
        let chunk = absN % 1000;
        if (chunk > 0) {
            let chunkStr = '';
            if (chunk >= 100) {
                chunkStr += ONES_EN[Math.floor(chunk / 100)] + ' hundred';
                chunk %= 100;
                if (chunk > 0) chunkStr += ' and ';
            }
            if (chunk >= 20) {
                chunkStr += TENS_EN[Math.floor(chunk / 10)];
                if (chunk % 10 > 0) chunkStr += '-' + ONES_EN[chunk % 10];
            } else if (chunk > 0) {
                chunkStr += ONES_EN[chunk];
            }
            if (SCALES_EN[scaleIdx]) {
                chunkStr += ' ' + SCALES_EN[scaleIdx];
            }
            parts.unshift(chunkStr);
        }
        absN = Math.floor(absN / 1000);
        scaleIdx++;
    }

    return (isNeg ? 'minus ' : '') + parts.join(', ');
}

export function integerToVietnamese(n: number): string {
    if (n === 0) return 'không';
    if (n === 1) return 'một';
    if (n === 2) return 'hai';
    if (n === 3) return 'ba';
    if (n === 4) return 'bốn';
    if (n === 5) return 'năm';
    if (n === 6) return 'sáu';
    if (n === 7) return 'bảy';
    if (n === 8) return 'tám';
    if (n === 9) return 'chín';
    if (n === 10) return 'mười';

    const isNeg = n < 0;
    let absN = Math.abs(n);
    const scales = ['', 'nghìn', 'triệu', 'tỷ'];
    const parts: string[] = [];
    let scaleIdx = 0;

    while (absN > 0 && scaleIdx < scales.length) {
        const chunk = absN % 1000;
        if (chunk > 0) {
            const h = Math.floor(chunk / 100);
            const t = Math.floor((chunk % 100) / 10);
            const o = chunk % 10;
            let str = '';

            if (h > 0 || parts.length > 0) {
                str += DIGITS_VI[h] + ' trăm ';
            }

            if (t > 1) {
                str += DIGITS_VI[t] + ' mươi ';
                if (o === 1) str += 'mốt';
                else if (o === 5) str += 'lăm';
                else if (o > 0) str += DIGITS_VI[o];
            } else if (t === 1) {
                str += 'mười ';
                if (o === 5) str += 'lăm';
                else if (o > 0) str += DIGITS_VI[o];
            } else if (o > 0) {
                if (h > 0 || parts.length > 0) str += 'lẻ ';
                str += DIGITS_VI[o];
            }

            str = str.trim();
            if (scales[scaleIdx]) str += ' ' + scales[scaleIdx];
            parts.unshift(str);
        }
        absN = Math.floor(absN / 1000);
        scaleIdx++;
    }

    return (isNeg ? 'âm ' : '') + parts.join(' ').trim();
}

// ==========================================
// 2. ROMAN NUMERALS & ORDINALS
// ==========================================

const ROMAN_MAP: Record<string, number> = {
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
    'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10,
    'xi': 11, 'xii': 12, 'xiii': 13, 'xiv': 14, 'xv': 15,
    'xvi': 16, 'xvii': 17, 'xviii': 18, 'xix': 19, 'xx': 20,
    'xxx': 30, 'xl': 40, 'l': 50, 'lx': 60, 'lxx': 70, 'lxxx': 80, 'xc': 90,
    'c': 100, 'cd': 400, 'd': 500, 'cm': 900, 'm': 1000
};

const ORDINALS_MAP: Record<string, { en: string; vi: string; base: number }> = {
    '1st': { en: 'first', vi: 'thứ nhất / đầu tiên', base: 1 },
    '2nd': { en: 'second', vi: 'thứ hai', base: 2 },
    '3rd': { en: 'third', vi: 'thứ ba', base: 3 },
    '4th': { en: 'fourth', vi: 'thứ tư', base: 4 },
    '5th': { en: 'fifth', vi: 'thứ năm', base: 5 },
    '6th': { en: 'sixth', vi: 'thứ sáu', base: 6 },
    '7th': { en: 'seventh', vi: 'thứ bảy', base: 7 },
    '8th': { en: 'eighth', vi: 'thứ tám', base: 8 },
    '9th': { en: 'ninth', vi: 'thứ chín', base: 9 },
    '10th': { en: 'tenth', vi: 'thứ mười', base: 10 }
};

// ==========================================
// 3. NUMBER PARSER
// ==========================================

export function parseNumberEntry(input: string): LanguageResult[] | null {
    const raw = input.trim().toLowerCase();

    // A. Số thứ tự (1st, 2nd, 3rd...)
    if (ORDINALS_MAP[raw]) {
        const ord = ORDINALS_MAP[raw];
        return [
            {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(ord.en)}&lang=en`,
                meanings: [
                    {
                        definition: `Số thứ tự ${raw}: "${ord.en}" (${ord.vi}).`,
                        definition_lang: 'vi',
                        example: `He finished in ${raw} place.`,
                        pos: 'Số thứ tự',
                        sub_pos: 'Ordinal number',
                        source: 'Number Engine',
                        links: [ord.en]
                    }
                ],
                pronunciations: [],
                translations: [{ lang_code: 'vi', lang_name: 'Tiếng Việt', translation: ord.vi }],
                relations: [{ related_word: String(ord.base), relation_type: 'Số đếm' }]
            }
        ];
    }

    // B. Số La Mã (I, II, III, IV, V, X...)
    if (ROMAN_MAP[raw]) {
        const val = ROMAN_MAP[raw];
        const enWords = integerToEnglish(val);
        const viWords = integerToVietnamese(val);
        return [
            {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(enWords)}&lang=en`,
                meanings: [
                    {
                        definition: `Chữ số La Mã "${raw.toUpperCase()}" tương ứng với số ${val} (Tiếng Anh: ${enWords}, Tiếng Việt: ${viWords}).`,
                        definition_lang: 'vi',
                        example: `Chapter ${raw.toUpperCase()} (Chương ${val}).`,
                        pos: 'Số La Mã',
                        sub_pos: 'Roman numeral',
                        source: 'Number Engine',
                        links: [String(val), enWords]
                    }
                ],
                pronunciations: [],
                translations: [{ lang_code: 'vi', lang_name: 'Tiếng Việt', translation: `Số ${val} (${viWords})` }],
                relations: [{ related_word: String(val), relation_type: 'Số tự nhiên' }]
            }
        ];
    }

    // C. Số nguyên hoặc số thập phân chuẩn (vd: 0, 1, 100, 2024, -5, 3.14)
    const cleanedNumber = raw.replace(/,/g, '');
    if (/^-?\d+(\.\d+)?$/.test(cleanedNumber)) {
        const num = parseFloat(cleanedNumber);
        const isInt = Number.isInteger(num);
        let enWords = '';
        let viWords = '';

        if (isInt && Math.abs(num) < 1e15) {
            enWords = integerToEnglish(num);
            viWords = integerToVietnamese(num);
        } else {
            // Decimal
            const [intPart, decPart] = cleanedNumber.split('.');
            const intEn = integerToEnglish(parseInt(intPart, 10));
            const decEn = decPart.split('').map(d => ONES_EN[parseInt(d, 10)]).join(' ');
            enWords = `${intEn} point ${decEn}`;

            const intVi = integerToVietnamese(parseInt(intPart, 10));
            const decVi = decPart.split('').map(d => DIGITS_VI[parseInt(d, 10)]).join(' ');
            viWords = `${intVi} phẩy ${decVi}`;
        }

        return [
            {
                lang_code: 'en',
                lang_name: 'Tiếng Anh',
                audio: `/api/v1/tts?word=${encodeURIComponent(enWords)}&lang=en`,
                meanings: [
                    {
                        definition: `Số ${input}: Cách đọc tiếng Anh là "${enWords}".`,
                        definition_lang: 'vi',
                        example: `There are ${input} items.`,
                        pos: 'Số từ',
                        sub_pos: isInt ? 'Số nguyên' : 'Số thập phân',
                        source: 'Number Engine',
                        links: [enWords]
                    }
                ],
                pronunciations: [],
                translations: [{ lang_code: 'vi', lang_name: 'Tiếng Việt', translation: viWords }],
                relations: []
            },
            {
                lang_code: 'vi',
                lang_name: 'Tiếng Việt',
                audio: `/api/v1/tts?word=${encodeURIComponent(viWords)}&lang=vi`,
                meanings: [
                    {
                        definition: `Số ${input}: Cách đọc tiếng Việt là "${viWords}".`,
                        definition_lang: 'vi',
                        example: `Có ${input} người.`,
                        pos: 'Số từ',
                        sub_pos: isInt ? 'Số nguyên' : 'Số thập phân',
                        source: 'Number Engine',
                        links: []
                    }
                ],
                pronunciations: [],
                translations: [{ lang_code: 'en', lang_name: 'Tiếng Anh', translation: enWords }],
                relations: []
            }
        ];
    }

    return null;
}

// ==========================================
// 4. TIME PARSER
// ==========================================

export function parseTimeEntry(input: string): LanguageResult[] | null {
    const raw = input.trim().toLowerCase();

    // Hỗ trợ định dạng: 10:30, 10h30, 10:30am, 10:30pm, 7am, 7pm, 10h
    const timeMatch = raw.match(/^(\d{1,2})[:h](\d{2})?\s*(am|pm)?$/) || raw.match(/^(\d{1,2})\s*(am|pm)$/);
    if (!timeMatch) return null;

    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = (timeMatch[3] || '').toLowerCase();

    if (hour > 24 || minute >= 60) return null;

    // English time phrase
    let enSpoken = '';
    const hourEn = ONES_EN[hour % 12 || 12];
    const nextHourEn = ONES_EN[(hour + 1) % 12 || 12];

    if (minute === 0) {
        if (hour === 0 || hour === 24) enSpoken = 'midnight (12:00 AM)';
        else if (hour === 12 && !meridiem.includes('am')) enSpoken = 'noon (12:00 PM)';
        else enSpoken = `${hourEn} o'clock`;
    } else if (minute === 15) {
        enSpoken = `quarter past ${hourEn} (${hourEn} fifteen)`;
    } else if (minute === 30) {
        enSpoken = `half past ${hourEn} (${hourEn} thirty)`;
    } else if (minute === 45) {
        enSpoken = `quarter to ${nextHourEn} (${hourEn} forty-five)`;
    } else if (minute < 30) {
        enSpoken = `${minute} minutes past ${hourEn}`;
    } else {
        enSpoken = `${60 - minute} minutes to ${nextHourEn}`;
    }

    if (meridiem) {
        enSpoken += ` ${meridiem.toUpperCase()}`;
    }

    // Vietnamese time phrase
    let viSpoken = '';
    const hourVi = DIGITS_VI[hour] || String(hour);
    if (minute === 0) {
        viSpoken = `${hour} giờ đúng`;
    } else if (minute === 30) {
        viSpoken = `${hour} giờ ba mươi phút (hoặc ${hour} giờ rưỡi)`;
    } else if (minute > 30 && hour < 24) {
        viSpoken = `${hour} giờ ${minute} phút (hoặc ${hour + 1} giờ kém ${60 - minute})`;
    } else {
        viSpoken = `${hour} giờ ${minute} phút`;
    }

    if (meridiem === 'am') viSpoken += ' (sáng)';
    else if (meridiem === 'pm') {
        if (hour >= 18 || hour < 4) viSpoken += ' (tối / đêm)';
        else viSpoken += ' (chiều)';
    }

    return [
        {
            lang_code: 'en',
            lang_name: 'Tiếng Anh',
            audio: `/api/v1/tts?word=${encodeURIComponent(enSpoken)}&lang=en`,
            meanings: [
                {
                    definition: `Thời gian ${input}: Cách đọc tiếng Anh là "${enSpoken}".`,
                    definition_lang: 'vi',
                    example: `The meeting starts at ${input}.`,
                    pos: 'Thời gian',
                    sub_pos: 'Mốc thời gian',
                    source: 'Time Engine',
                    links: [hourEn]
                }
            ],
            pronunciations: [],
            translations: [{ lang_code: 'vi', lang_name: 'Tiếng Việt', translation: viSpoken }],
            relations: []
        },
        {
            lang_code: 'vi',
            lang_name: 'Tiếng Việt',
            audio: `/api/v1/tts?word=${encodeURIComponent(viSpoken)}&lang=vi`,
            meanings: [
                {
                    definition: `Thời gian ${input}: Cách đọc tiếng Việt là "${viSpoken}".`,
                    definition_lang: 'vi',
                    example: `Buổi hẹn lúc ${input}.`,
                    pos: 'Thời gian',
                    sub_pos: 'Mốc thời gian',
                    source: 'Time Engine',
                    links: []
                }
            ],
            pronunciations: [],
            translations: [{ lang_code: 'en', lang_name: 'Tiếng Anh', translation: enSpoken }],
            relations: []
        }
    ];
}
