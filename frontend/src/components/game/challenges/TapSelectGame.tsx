import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TapSelectGameProps {
    data: {
        q: string;
        a: string | string[]; // Can be single or array
    };
    onComplete: (xp: number) => void;
}

export const TapSelectGame = ({ data, onComplete }: TapSelectGameProps) => {
    const correctAnswers = Array.isArray(data.a) ? data.a : [data.a];

    const distractors = ["Stranger", "Unknown Link", "Candy", "Secret", "Alone"]
        .filter(d => !correctAnswers.includes(d))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    const allOptions = [...correctAnswers, ...distractors].sort(() => 0.5 - Math.random());

    const [selected, setSelected] = useState<string[]>([]);

    const handleTap = (opt: string) => {
        if (selected.includes(opt)) return;

        const isCorrect = correctAnswers.includes(opt);
        if (isCorrect) {
            const newSelected = [...selected, opt];
            setSelected(newSelected);

            // Check if all correct found
            // Filter how many correct in allOptions?
            // Actually just need to find all correct ones present in this specific generated set?
            // Yes.
            const totalCorrectVisible = allOptions.filter(o => correctAnswers.includes(o)).length;
            const totalFound = newSelected.filter(s => correctAnswers.includes(s)).length;

            if (totalFound === totalCorrectVisible) {
                // Done
                setTimeout(() => onComplete(1), 500);
            }
        } else {
            // Wrong tap
            // Just shake or red 
            // For simplicity, alert
            // alert("Oops! Not safe.");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white text-center mb-8">{data.q}</h2>

            <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                {allOptions.map((opt, idx) => {
                    const isSelected = selected.includes(opt);
                    const isCorrect = correctAnswers.includes(opt);

                    return (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTap(opt)}
                            className={`
                                relative p-8 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transition-colors
                                ${isSelected
                                    ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            {opt}
                            {isSelected && isCorrect && <Check className="absolute top-2 right-2" />}
                            {/* Note: logic prevents selecting wrong ones in state currently, but if we did: */}
                        </motion.button>
                    )
                })}
            </div>
            <p className="text-center text-white/60 mt-4">Tap all correct answers</p>
        </div>
    );
};
