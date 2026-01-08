import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MazeProvider } from '../context/MazeContext';
import { MazeGame } from '../components/game/MazeGame';
import { X } from 'lucide-react';

const MazePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const levelId = searchParams.get('levelId') || undefined;

    const handleClose = () => {
        navigate('/play');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleClose}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Game Container */}
            <div className="flex-1 w-full h-full relative overflow-hidden">
                <MazeProvider onComplete={handleClose}>
                    <MazeGame onClose={handleClose} levelId={levelId} />
                </MazeProvider>
            </div>
        </div>
    );
};

export default MazePage;
