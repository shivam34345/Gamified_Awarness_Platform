import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import { GameCard } from "@/components/ui/GameCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useState } from "react";

// ... imports

interface Topic {
    id: string;
    name: string; // or title
    progress: number;
    color: string;
    title?: string; // Handle both
}

interface TopicProgressListProps {
    topics?: Topic[];
}

export const TopicProgressList = ({ topics = [] }: TopicProgressListProps) => {
    const [end , setEnd] = useState<number>(4);
    return (
        <GameCard glow="none">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-bold text-dark">Your Journey</h3>
                <Link to="/play" className="text-primary font-nunito font-bold text-sm flex items-center gap-1 hover:underline">
                    Start Playing <ChevronRight size={16} />
                </Link>
            </div>

            <div className="space-y-4">
                {topics.slice(0,end).map((topic, index) => {
                    const displayTitle = topic.title || topic.name;
                    // Ensure color is a valid class string or handle defaults
                    const colorClass = topic.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        topic.color === 'green' ? 'from-green-400 to-green-600' :
                            topic.color === 'orange' ? 'from-orange-400 to-orange-600' :
                                'from-purple-400 to-purple-600'; // Default fallback

                    return (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                    <BookOpen size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-nunito font-bold text-dark">{displayTitle}</span>
                                        {displayTitle !== "Knowledge Hub" && (
                                            <span className="font-nunito font-bold text-primary">{topic.progress}%</span>
                                        )}
                                    </div>
                                    {displayTitle !== "Knowledge Hub" && (
                                        <ProgressBar
                                            current={topic.progress}
                                            max={100}
                                            showLabel={false}
                                            variant={topic.progress === 100 ? "accent" : "primary"}
                                            size="sm"
                                        />
                                    )}
                                    {displayTitle === "Knowledge Hub" && (
                                        <p className="text-xs text-gray-500 font-nunito">Explore articles & documents</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                {topics.length === 0 && (
                    <div className="text-center text-gray-400 font-nunito text-sm py-4">
                        Start playing to see progress!
                    </div>
                )}
            </div>
            {end < topics.length && <div className="flex items-center justify-center mt-4">
                <button
                    onClick={() => setEnd(end + 4)}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                    Show More
                </button>
            </div>}
        </GameCard>
    );
};
