export interface Meaning {
    definition: string;
    definition_lang: string;
    example: string | null;
    pos: string;
    sub_pos: string | null;
    source: string | null;
    links: string[];
}

export interface Pronunciation {
    ipa: string;
    region: string | null;
    audio?: string;
}

export interface Translation {
    lang_code: string;
    lang_name: string | null;
    translation: string;
}

export interface Relation {
    related_word: string;
    relation_type: string;
}

export interface LanguageResult {
    lang_code: string;
    lang_name: string;
    audio: string;
    meanings: Meaning[];
    pronunciations: Pronunciation[];
    translations: Translation[];
    relations: Relation[];
    synonyms?: string[];
    antonyms?: string[];
}

export interface LookupResult {
    exists: boolean;
    word: string;
    results: LanguageResult[];
}
