import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import { gameApi } from '../../../lib/api';
import { toast } from 'react-hot-toast';

// Import Game Components (will be created next)
import { DragDropGame } from './DragDropGame';
import { ScenarioGame } from './ScenarioGame';
import { TapSelectGame } from './TapSelectGame';
import { StoryGame } from './StoryGame';
import { TimeChallengeGame } from './TimeChallengeGame';

interface ChallengeGameProps {
    level: any;
    onClose: () => void;
    mode?: 'sequence' | 'single';
}

export const ChallengeGame = ({ level, onClose, mode = 'sequence' }: ChallengeGameProps) => {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (level && level.games) {
            // Flatten games into a sequence
            const sequence: any[] = [];

            if (level.games.drag) level.games.drag.forEach((g: any, i: number) => sequence.push({ ...g, type: 'drag', id: `drag-${i}` }));
            if (level.games.situation) level.games.situation.forEach((g: any, i: number) => sequence.push({ ...g, type: 'situation', id: `situation-${i}` }));
            if (level.games.tap) level.games.tap.forEach((g: any, i: number) => sequence.push({ ...g, type: 'tap', id: `tap-${i}` }));
            if (level.games.story) level.games.story.forEach((g: any, i: number) => sequence.push({ ...g, type: 'story', id: `story-${i}` }));
            if (level.games.time) level.games.time.forEach((g: any, i: number) => sequence.push({ ...g, type: 'time', id: `time-${i}` }));

            if (mode === 'single' && sequence.length > 0) {
                // Pick one random challenge
                const randomChallenge = sequence[Math.floor(Math.random() * sequence.length)];
                setChallenges([randomChallenge]);
            } else {
                setChallenges(sequence);
            }

            setLoading(false);
        }
    }, [level, mode]);

    const handleChallengeComplete = async (xp: number) => {
        // Award XP via API
        try {
            // In single mode, the parent component handles the "Solve Puzzle" API call usually?
            // Or does ChallengeGame handle it?
            // The parent MazeContext.solvePuzzle calls the API. 
            // But ChallengeGame is designed to be standalone-ish.
            // If mode is single, we should probably just return success to parent?
            // BUT: onComplete prop is just for UI closing in current code. 
            // The XP award happens here: await gameApi.awardChallengeXP

            // Let's keep awarding XP for the specific mini-game here.
            // But for the Maze Lock, the context also calls `completePuzzle` which awards XP.
            // We might be double dipping if we are not careful.
            // However, `awardChallengeXP` seems unimplemented/placeholder in my mind? 
            // In `game.controller.ts` I should check.
            // Assuming for now we award XP here for the *game* and MazeContext awards XP for the *puzzle*.
            // That's fine.

            // Removed immediate API call to prevent double counting and API spam.
            // XP is now batched and awarded at level completion via MazeContext -> key puzzle IDs.

            setScore(prev => prev + xp);
            // toast.success(`+${xp} XP!`, { icon: '⭐' }); // Context might handle this or we wait for level end? 
            // Let's keep a small UI feedback but clarify it's "Puzzle Solved"
            toast.success("Challenge Solved!", { icon: '✅' });

            // Next Challenge Logic
            if (currentIndex < challenges.length - 1) {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 1000);
            } else {
                setGameOver(true);

                // If single mode, we might want to just close automaticall or show small victory?
                if (mode === 'single') {
                    // In maze mode, we don't complete the whole level here.
                    setTimeout(onClose, 1500);
                    return;
                }

                await gameApi.completeLevel(level.levelId, 3);
            }
        } catch (error) {
            console.error("XP Error", error);
            if (currentIndex < challenges.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setGameOver(true);
                if (mode === 'single') {
                    setTimeout(onClose, 1500);
                }
            }
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Challenges...</div>;

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="bg-white/10 p-8 rounded-3xl backdrop-blur-md text-center border border-white/20"
                >
                    <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Level Complete!</h2>
                    <p className="text-xl mb-6">You earned {score} XP!</p>
                    <button onClick={onClose} className="bg-primary hover:bg-primary-dark px-8 py-3 rounded-xl font-bold transition-colors">
                        Continue Adventure
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentChallenge = challenges[currentIndex];

    // Identify game component
    let GameComponent;
    switch (currentChallenge.type) {
        case 'drag': GameComponent = DragDropGame; break;
        case 'situation': GameComponent = ScenarioGame; break;
        case 'tap': GameComponent = TapSelectGame; break;
        case 'story': GameComponent = StoryGame; break;
        case 'time': GameComponent = TimeChallengeGame; break;
        default: GameComponent = () => <div>Unknown Game Type</div>;
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <span className="text-white/60 font-bold">Challenge {currentIndex + 1}/{challenges.length}</span>
                    <div className="h-2 w-32 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-400 transition-all duration-500"
                            style={{ width: `${((currentIndex) / challenges.length) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-yellow-300 font-bold text-xl">
                    <Star fill="currentColor" /> {score} XP
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="h-full"
                    >
                        <GameComponent
                            data={currentChallenge}
                            onComplete={handleChallengeComplete}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
