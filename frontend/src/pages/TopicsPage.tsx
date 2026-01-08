import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GameCard } from "@/components/ui/GameCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gameApi } from "@/lib/api";

const TopicsPage = () => {
    const { user } = useAuth();
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopicsData = async () => {
            try {
                const mapRes = await gameApi.getMapData();

                if (user && user.progress && mapRes.data) {
                    const mapData = mapRes.data;
                    const calculatedTopics = mapData.map((region: any) => {
                        const totalLevels = region.levels.length;
                        const completedInRegion = user.progress.filter((p: any) =>
                            p.status === 'completed' &&
                            region.levels.some((l: any) => l.levelId === p.levelId)
                        ).length;

                        // Descriptive texts for regions
                        let desc = region.description || "Explore this topic to learn more!";

                        return {
                            id: region.regionId,
                            title: region.title, // Use title from backend
                            desc: desc,
                            progress: Math.round((completedInRegion / (totalLevels || 1)) * 100),
                            color: region.bgGradient || "from-blue-400 to-blue-600", // Use bgGradient for cards
                            completedLevels: completedInRegion,
                            totalLevels: totalLevels
                        };
                    });
                    setTopics(calculatedTopics);
                }
            } catch (error) {
                console.error("Failed to load topics", error);
            } finally {
                setLoading(false);
            }
        };

        // If user is loaded
        if (user) {
            fetchTopicsData();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-light">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-dark">Knowledge Hub</h1>
                    <p className="text-dark-lighter font-nunito">Explore and master your rights!</p>
                </div>
            </header>

            <div className="p-4 lg:p-8 pt-0">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading topics...</div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {topics.map((topic, index) => {
                            // Ensure color is a valid class string (simple patch) or depend on style prop
                            // Assuming backend/calc returns proper strings or we map them
                            const colorClass = topic.color.startsWith('from-') ? topic.color : 'from-blue-400 to-blue-600';

                            return (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GameCard className="h-full flex flex-col justify-between" glow="none">
                                        <div>
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md mb-4`}>
                                                <BookOpen size={24} className="text-white" />
                                            </div>
                                            <h3 className="text-xl font-display font-bold text-dark mb-2">{topic.title}</h3>
                                            <p className="text-dark-lighter text-sm font-nunito mb-6">{topic.desc}</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-dark-lighter">Mastery</span>
                                                <span className="text-primary">{topic.progress}%</span>
                                            </div>
                                            <ProgressBar current={topic.progress} max={100} size="sm" />
                                            <Link to="/play">
                                                <button className="w-full mt-4 py-2 rounded-lg bg-gray-50 text-dark font-bold hover:bg-primary hover:text-white transition-colors">
                                                    {topic.progress === 100 ? 'Review' : topic.progress > 0 ? 'Continue' : 'Start Learning'}
                                                </button>
                                            </Link>
                                        </div>
                                    </GameCard>
                                </motion.div>
                            )
                        })}
                        {topics.length === 0 && (
                            <div className="col-span-full text-center text-gray-400">No topics found. Check back later!</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicsPage;
