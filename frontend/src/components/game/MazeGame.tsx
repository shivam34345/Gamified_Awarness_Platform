import { useEffect } from 'react';
import { useMaze } from '../../context/MazeContext';
import { MazeRenderer } from './MazeRenderer';
import { GameButton } from '../ui/GameButton';

interface MazeGameProps {
    onClose?: () => void;
    levelId?: string;
}

export const MazeGame = ({ onClose, levelId }: MazeGameProps) => {
    const { generateNewMaze } = useMaze();

    useEffect(() => {
        // Generate initial maze with proper dimensions
        generateNewMaze({
            width: 20,
            height: 20,
            seed: Date.now(),
            difficulty: 'EASY',
            puzzleDensity: 0.1
        }, levelId);
    }, [levelId]);

    return (
        <div className="flex items-center justify-around w-full h-full p-4 relative">
            <div className="mb-4 shrink-0">
                <h2 className="text-3xl font-display text-white text-center">Level Challenge</h2>

                <div className="mt-1 w-[70vw] min-h-0 bg-slate-900 p-4 rounded-xl border-4 border-slate-700 shadow-2xl relative overflow-hidden">
                    <MazeRenderer />
                </div>
            </div>

            <div className="mt-4 shrink-0 text-slate-300 font-nunito text-center max-w-md bg-slate-800/80 p-3 rounded-xl backdrop-blur-sm">
                <p>Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move.</p>
                <p className="text-sm mt-1 text-slate-400">Reach the <span className="text-yellow-400 font-bold">Trophy</span> to complete the level!</p>
            </div>
        </div>
    );
};
