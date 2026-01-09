

interface StoryGameProps {
    data: {
        q: string;
        a: string;
    };
    onComplete: (xp: number) => void;
}

export const StoryGame = ({ data, onComplete }: StoryGameProps) => {
    // Story game: "Short comic / Choices affect outcome"
    // Data: { q: "Riya scared walking home", a: "Call trusted adult" }

    // We can present this as a narrative card.

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto pt-10">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-40 bg-purple-600 flex items-center justify-center">
                    <span className="text-6xl">📖</span>
                </div>
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">The Story</h3>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        "{data.q}..."
                    </p>

                    <h4 className="font-bold text-gray-500 uppercase text-sm mb-4">What happens next?</h4>

                    <button
                        onClick={() => onComplete(3)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {data.a} <span className="opacity-50">➔</span>
                    </button>

                    <div className="mt-4 text-center text-gray-400 text-sm">
                        Choose the best outcome to continue the story.
                    </div>
                </div>
            </div>
        </div>
    );
};
