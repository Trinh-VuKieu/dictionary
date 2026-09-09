import { trackTTSPlay } from '@/lib/gtag';

interface WordHeaderProps {
    word: string;
    audio: string | null;
}

export default function WordHeader({ word, audio }: WordHeaderProps) {
    const playAudio = () => {
        if (audio) {
            // Track TTS play event
            trackTTSPlay(word);

            const player = new Audio(audio);
            player.crossOrigin = 'anonymous';
            player.play().catch(e => console.error('Audio play error:', e));
        }
    };

    return (
        <h2 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-3 text-gray-900 dark:text-white">
            {word}
            {audio && (
                <button
                    onClick={playAudio}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-blue-500 transition-all group/tts cursor-pointer"
                    title="Phát âm"
                >
                    <svg className="w-5 h-5 group-active/tts:scale-95 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                </button>
            )}
        </h2>
    );
}
