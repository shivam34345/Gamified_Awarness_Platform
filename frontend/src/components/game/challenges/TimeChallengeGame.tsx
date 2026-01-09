import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeChallengeGameProps {
    data: {
        q: string;
        a: string[];
    };
    onComplete: (xp: number) => void;
}

export const TimeChallengeGame = ({ data, onComplete }: TimeChallengeGameProps) => {
    const [timeLeft, setTimeLeft] = useState(10);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setActive(false);
                    // Time out!
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [active]);

    // Options
    const correct = data.a;
    const distractors = ["Run away", "Hide", "Cry", "Ignore"].filter(d => !correct.includes(d)).slice(0, 2);
    const options = [...correct, ...distractors].sort(() => 0.5 - Math.random()); // Show all answers? Or just one correct?
    // Data: { q: "Tap safe choices", a: ["Parents", "Friends"] }
    // It's a "Tap all" or "Tap one"?
    // "Identify scam message" -> singular.

    const handleSelect = (opt: string) => {
        if (!active) return;

        if (correct.includes(opt)) {
            setActive(false);
            onComplete(2);
        } else {
            // Wrong
            setTimeLeft(prev => Math.max(0, prev - 2)); // Penalty
        }
    };

    return (
        <div className="flex flex-col h-full bg-red-500/10 p-4 rounded-3xl border-2 border-red-500/30">
            {/* Timer Header */}
            <div className="flex justify-center mb-8">
                <div className={`
                    flex items-center gap-2 px-6 py-2 rounded-full font-mono text-2xl font-bold
                    ${timeLeft < 5 ? 'bg-red-600 animate-pulse text-white' : 'bg-black/30 text-white'}
                `}>
                    <Clock /> {timeLeft}s
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white text-center mb-8">{data.q}</h2>

            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(opt)}
                        className="bg-white text-red-600 font-bold text-xl py-4 rounded-xl shadow-lg border-b-4 border-red-200"
                    >
                        {opt}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
