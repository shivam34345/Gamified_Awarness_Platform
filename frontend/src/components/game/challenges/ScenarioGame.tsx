import { motion } from 'framer-motion';

interface ScenarioGameProps {
    data: {
        q: string;
        a: string; // The correct answer string
    };
    onComplete: (xp: number) => void;
}

export const ScenarioGame = ({ data, onComplete }: ScenarioGameProps) => {
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
