import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { GameCard } from "@/components/ui/GameCard";
import { GameBadge } from "@/components/ui/GameBadge";
import { GameButton } from "@/components/ui/GameButton";

import { getAvatarSeed } from "@/utils/avatarUtils";

interface Player {
    username: string;
    totalStars: number;
    avatarId: string;
}

interface LeaderboardPreviewProps {
    players: Player[];
}

export const LeaderboardPreview = ({ players }: LeaderboardPreviewProps) => {
    return (
        <GameCard glow="none">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-bold text-dark flex items-center gap-2">
                    <TrendingUp size={20} className="text-secondary" />
                    Leaderboard
                </h3>
                <GameBadge variant="secondary">
                    Top 10
                </GameBadge>
            </div>

            <div className="space-y-3">
                {players.slice(0, 3).map((player, index) => (
                    <motion.div
                        key={player.username}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-fredoka font-bold text-sm shadow-sm ${index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                            index === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                'bg-orange-100 text-orange-600 border border-orange-200'
                            }`}>
                            {index + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed(player.avatarId)}`}
                                alt={player.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-nunito font-bold text-dark text-sm">{player.username}</p>
                        </div>
                        <span className="font-fredoka font-bold text-primary text-sm">{player.totalStars.toLocaleString()}</span>
                    </motion.div>
                ))}
                {players.length === 0 && (
                    <div className="text-center text-gray-400 font-nunito text-sm py-4">
                        No players yet
                    </div>
                )}
            </div>

            <Link to="/leaderboard">
                <GameButton variant="outline" size="sm" glow={false} className="w-full mt-4">
                    View Full Leaderboard
                </GameButton>
            </Link>
        </GameCard>
    );
};
