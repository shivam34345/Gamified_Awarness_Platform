import { useState } from 'react';
import { motion } from 'framer-motion';

interface DragDropGameProps {
    data: {
        q: string;
        options: string[];
        a: string[] | Record<string, string>; // Array for simple classification, Record for matching
    };
    onComplete: (xp: number) => void;
}

export const DragDropGame = ({ data, onComplete }: DragDropGameProps) => {
    const [dropped, setDropped] = useState<string[]>([]);

    // Determine if it's a "Match" type or "Classification" type
    // JSON: "a": ["Parent", "Teacher"] -> Classification (e.g. "Safe")
    // JSON: "a": { "Unsafe": "1098", "Bullying": "Teacher" } -> Matching (NOT IMPLEMENTED fully in this basic version, defaulting to classification/selection for now based on most examples)
    // Actually, type 1 is "Drag Safe items into green box".
    // Let's implement a simple "Drag correct items to the Target Zone"

    const isMatching = !Array.isArray(data.a);
    const correctAnswers = isMatching ? Object.values(data.a) : (data.a as string[]);

    // For simplicity with framer-motion without complex dnd, we'll use "Click to Select" or "Drag to Zone"
    // Let's try true Drag with framer-motion constraints

    const handleDragEnd = (option: string, info: any) => {
        // Simple check: if dragged far enough down/to target
        // This is tricky without refs to zones.
        // Alternative: Click to move?
        // User requested "Drag & Drop".
        // Let's assume a "Target Zone" at the bottom.

        // If (info.point.y > 200) -> Dropped.
        if (info.offset.y > 100) {
            // Check if correct
            const isCorrect = correctAnswers.includes(option) || (isMatching && Object.keys(data.a).includes(option));
            // Wait, data.a keys might be the drops?

            // Let's stick to the example: "Drag 'Safe' items into green box"
            // options: ["Parent", "Teacher", "Police", "Stranger"]
            // a: ["Parent", "Teacher", "Police"]

            if (isCorrect) {
                if (!dropped.includes(option)) {
                    const newDropped = [...dropped, option];
                    setDropped(newDropped);

                    if (newDropped.length === correctAnswers.length) {
                        onComplete(1); // Easy = 1 XP
                    }
                }
            } else {
                // Wrong item
                // Maybe shake animation?
            }
        }
    };

    return (
        <div className="flex flex-col items-center h-full gap-8">
            <h2 className="text-2xl font-bold text-white text-center bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                {data.q}
            </h2>

            {/* Options Area */}
            <div className="flex flex-wrap gap-4 justify-center flex-1 items-start content-start w-full">
                {data.options?.map((opt) => (
                    !dropped.includes(opt) && (
                        <motion.div
                            drag
                            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} // Free drag but snaps back if not "consumed" logic? 
                            // Actually better: dragSnapToOrigin={true} unless dropped
                            dragSnapToOrigin={true}
                            onDragEnd={(_, info) => handleDragEnd(opt, info)}
                            whileHover={{ scale: 1.1, cursor: 'grab' }}
                            whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 100 }}
                            key={opt}
                            className="bg-white text-blue-900 font-bold px-6 py-3 rounded-full shadow-lg border-b-4 border-blue-200 select-none"
                        >
                            {opt}
                        </motion.div>
                    )
                ))}
            </div>

            {/* Drop Zone */}
            <div className="w-full max-w-md h-48 bg-green-500/30 border-4 border-green-400 border-dashed rounded-3xl flex flex-col items-center justify-center relative mb-8 backdrop-blur-sm">
                <p className="text-white/80 font-bold text-lg animate-pulse pointer-events-none">
                    Drop Correct Answers Here
                </p>

                {/* Collected Items */}
                <div className="absolute inset-0 flex flex-wrap gap-2 p-4 items-center justify-center pointer-events-none">
                    {dropped.map(item => (
                        <motion.div
                            layoutId={item}
                            key={item}
                            className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-lg"
                        >
                            {item}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
