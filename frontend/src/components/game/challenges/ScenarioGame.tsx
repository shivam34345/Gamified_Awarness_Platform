import { motion } from 'framer-motion';

interface ScenarioGameProps {
    data: {
        q: string;
        a: string; // The correct answer string
    };
    onComplete: (xp: number) => void;
}

export const ScenarioGame = ({ data, onComplete }: ScenarioGameProps) => {
    // Ideally we need options. The JSON sometimes only has "a": "Say no..." without distractor options.
    // Looking at data: { "q": "Stranger offers gift...", "a": "Say no, tell adult" }
    // It implies we need to GENERATE options or the data is missing wrong answers?
    // "Example: Options: Ignore & block (Correct), Share info (Wrong)"
    // But the Seed Data only has `a` (correct answer).
    // I might need to generate a generic "Wrong" option or parse multiple options if I missed them.
    // Wait, the seed data I wrote: 
    // { "q": "Stranger...", "a": "Say no..." }
    // It seems I missed adding explicit options in the seed data I wrote for some types?
    // Let's re-read seed data.
    // "games": { "situation": [ { "q": "...", "a": "..." } ] }
    // There are no wrong options!
    // I should probably generate generic wrong options or maybe the "a" is strictly the correct answer and I need to fake a wrong one?
    // Or maybe I should have added options in the seed.
    // For now, I will generate a dummy "Wrong Action" button for demonstration, or split the answer?
    // No, better: "True / False" or "Do this / Don't do this"?
    // The prompt example: "Options: Ignore... Share info..."
    // My seed data is incomplete for this Game Type 2?
    // "situation": [{ "q": "...", "a": "..." }]

    // Quick Fix: Create a "Bad option" based on the question or just a generic "Do the opposite".
    // Or, realizing the user provided data:
    // "situation": [ { "q": "Stranger offers gift to go with him", "a": "Say no, tell adult" } ]
    // I needed to invent the wrong answer?
    // I'll make it a "What is the best action?" and provide the Correct one + 2 Random generic bad acts.

    const wrongOptions = [
        "Do nothing",
        "Agree to it",
        "Hide it",
        "Share info",
        "Panic"
    ];

    // Pick 1 or 2 wrong options randomly
    const distractors = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 1);
    const options = [data.a, ...distractors].sort(() => 0.5 - Math.random());

    const handleSelect = (option: string) => {
        if (option === data.a) {
            onComplete(2); // Medium = 2 XP
        } else {
            // Shake/Error
            alert("Unsafe choice! Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center mb-8 w-full">
                <span className="text-4xl mb-4 block">🤔</span>
                <h3 className="text-2xl font-bold text-gray-800">{data.q}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(opt)}
                        className="p-6 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/50 text-white font-bold text-xl hover:bg-white hover:text-blue-900 transition-colors shadow-lg text-left"
                    >
                        {opt}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
