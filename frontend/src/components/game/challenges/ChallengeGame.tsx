import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import Game Components (will be created next)
import { DragDropGame } from './DragDropGame';
import { DragOrderGame } from './DragOrderGame';
import { ScenarioGame } from './ScenarioGame';
import { TapSelectGame } from './TapSelectGame';
import { StoryGame } from './StoryGame';
import { VideoStoryGame } from './VideoStoryGame';
import { TimeChallengeGame } from './TimeChallengeGame';
import { QuizGame } from './QuizGame';
import { ReflectionGame } from './ReflectionGame';

import { type Challenge } from "..//../../types/challenge"

interface ChallengeGameProps {
    level: any;
    onClose: () => void;
    mode?: 'sequence' | 'single';
    puzzleId?: string;
}

export const ChallengeGame = ({ level, onClose, mode = 'sequence', puzzleId }: ChallengeGameProps) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (level) {
            // New Logic: Use level.challenges if available
            if (level.challenges && level.challenges.length > 0) {
                if (mode === 'single' && puzzleId) {
                    const foundChallenge = level.challenges.find((c: Challenge) => c._id === puzzleId);
                    if (foundChallenge) {
                        setChallenges([foundChallenge]);
                    } else {
                        console.error("Challenge not found for ID:", puzzleId);
                        setChallenges([]);
                    }
                } else {
                    setChallenges(level.challenges);
                }
                setLoading(false);
                return;
            }
        } else {
            toast.error("Level not found");
            onClose();
        }
    }, [level, puzzleId, mode]);

    const currentChallenge = challenges[currentIndex];

    const renderChallengeInfo = () => {
        if (!currentChallenge) return null;
        return (
            <div className="mb-4 bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                {currentChallenge.title && <h3 className="text-xl font-bold text-cyan-400 mb-2">{currentChallenge.title}</h3>}
                {currentChallenge.description && <p className="text-slate-300 mb-3">{currentChallenge.description}</p>}

                {currentChallenge.video && (
                    <div className="mb-4 aspect-video bg-black rounded overflow-hidden">
                        <iframe
                            src={currentChallenge.video}
                            title="Challenge Video"
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {currentChallenge.references && currentChallenge.references.length > 0 && (
                    <div className="mb-3">
                        <h4 className="text-sm font-semibold text-slate-400 mb-1">References:</h4>
                        <ul className="list-disc list-inside text-sm text-cyan-300">
                            {currentChallenge.references.map((ref: { title: string, url: string }, idx: number) => (
                                <li key={idx}>
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {ref.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const handleChallengeComplete = async (xp: number) => {
        try {
            // Use the XP from the challenge logic or the default passed value
            const earnedXp = challenges[currentIndex].xp || xp;
            setScore(prev => prev + earnedXp);
            toast.success(`Challenge Solved! +${earnedXp} XP`, { icon: '✅' });

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

    // Identify game component
    // Identify game component
    let GameComponent;
    const type = currentChallenge.type;
    const gameType = currentChallenge.gameType;

    if (type === 'story' && gameType === 'story_video') {
        GameComponent = VideoStoryGame;
    } else if (type === 'true_false_quiz') {
        GameComponent = QuizGame;
    } else if (type === 'reflection_story') {
        GameComponent = ReflectionGame;
    } else if (type === 'drag_and_match') {
        GameComponent = DragOrderGame;
    }
    // Legacy / Generic types
    else if (type === 'drag') {
        GameComponent = DragDropGame;
    } else if (type === 'situation') {
        GameComponent = ScenarioGame;
    } else if (type === 'tap') {
        GameComponent = TapSelectGame;
    } else if (type === 'story') {
        GameComponent = StoryGame;
    } else if (type === 'time') {
        GameComponent = TimeChallengeGame;
    } else {
        GameComponent = () => <div className="text-white p-4">Unknown Game Type: {type} {gameType && `(${gameType})`}</div>;
    }

    return (
        <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20"
            >
                ✕
            </button>

            {/* Challenge Info Header (Title, Video, Desc) */}
            {renderChallengeInfo()}

            {/* Game Status Header */}
            <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-700/50 pb-4">
                <div>
                    <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {type?.replace(/_/g, ' ').toUpperCase() || 'CHALLENGE'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-sm">Challenge {currentIndex + 1} of {challenges.length}</span>
                        {/* Progress Bar */}
                        <div className="h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="font-mono text-xl text-yellow-50">{score} XP</span>
                    </div>
                </div>
            </div>

            {/* Game Interaction Area */}
            <div className="flex-1 relative min-h-0">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                    >
                        <GameComponent
                            data={currentChallenge.data || currentChallenge}
                            onComplete={handleChallengeComplete}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
