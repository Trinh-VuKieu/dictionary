import { LookupResult } from '../types';
import LanguageTabs from './LanguageTabs';
import WordHeader from './WordHeader';
import MeaningItem from './MeaningItem';
import TranslationList from './TranslationList';
import RelationList from './RelationList';

interface DictionaryResultProps {
    result: LookupResult;
    selectedLang: number;
    setSelectedLang: (idx: number) => void;
    onWordClick: (word: string) => void;
    defLang?: string; // Filter definitions by this language
}

export default function DictionaryResult({ result, selectedLang, setSelectedLang, onWordClick, defLang }: DictionaryResultProps) {
    if (!result.exists || !result.results || result.results.length === 0) return null;

    const currentResult = result.results[selectedLang];
    if (!currentResult) return null;

    // Filter meanings by definition language if specified
    const filteredMeanings = defLang
        ? currentResult.meanings.filter(m => m.definition_lang === defLang)
        : currentResult.meanings;

    // If no meanings match the filter, don't show this result
    if (filteredMeanings.length === 0 && defLang) {
        return (
            <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
                <WordHeader word={result.word} audio={currentResult.audio} />
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                    Không có định nghĩa {defLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} cho từ này
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
            {/* Word Header & Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 mb-4 pb-4 sm:mb-6 sm:pb-6">
                <WordHeader word={result.word} audio={currentResult.audio} />
                <LanguageTabs results={result.results} selectedLang={selectedLang} setSelectedLang={setSelectedLang} />
            </div>

            {/* Selected Language Content */}
            <div>
                {/* Language Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                        {currentResult.lang_name}
                    </span>
                    {defLang && (
                        <span className="text-xs px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">
                            → {defLang === 'en' ? 'Anh' : 'Việt'}
                        </span>
                    )}
                    <span className="text-sm text-gray-400">
                        {filteredMeanings.length} định nghĩa
                    </span>
                </div>

                {/* Pronunciations */}
                {currentResult.pronunciations && currentResult.pronunciations.length > 0 && (
                    <div className="flex flex-nowrap gap-3 mb-6 overflow-x-auto no-scrollbar pb-1">
                        {currentResult.pronunciations.map((p, idx) => (
                            <div key={idx} className="flex-shrink-0 flex items-center gap-2 text-xs sm:text-sm bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 whitespace-nowrap shadow-sm">
                                {p.region && (
                                    <span className="text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wide">
                                        {p.region}:
                                    </span>
                                )}
                                <span className="font-mono text-blue-600 dark:text-blue-400">
                                    {p.ipa.startsWith('/') ? p.ipa : `/${p.ipa}/`}
                                </span>
                                {p.audio && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const sound = new Audio(p.audio!);
                                            sound.play().catch(console.error);
                                        }}
                                        className="text-gray-400 hover:text-blue-500 transition-colors p-0.5 rounded cursor-pointer"
                                        title={`Nghe phát âm giọng ${p.region || 'chuẩn'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Meanings */}
                <div className="space-y-8">
                    {filteredMeanings.map((m, idx) => (
                        <MeaningItem key={idx} meaning={m} index={idx} word={result.word} onWordClick={onWordClick} />
                    ))}
                </div>

                <TranslationList translations={currentResult.translations} onWordClick={onWordClick} />
                <RelationList relations={currentResult.relations} onWordClick={onWordClick} />
            </div>
        </div>
    );
}
