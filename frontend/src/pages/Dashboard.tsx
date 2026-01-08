import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { TopicProgressList } from "@/components/dashboard/TopicProgressList";
import { DailyQuestsList } from "@/components/dashboard/DailyQuestsList";
import { RecentBadgesList } from "@/components/dashboard/RecentBadgesList";
import { LeaderboardPreview } from "@/components/dashboard/LeaderboardPreview";

import { useState, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { gameApi } from "@/lib/api";
import { GameButton } from "@/components/ui/GameButton";
import toast from "react-hot-toast";

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [dailyQuests, setDailyQuests] = useState<any[]>([]);
    const [topicProgress, setTopicProgress] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [leaderboardRes, questsRes, mapRes] = await Promise.all([
                    gameApi.getLeaderboard(),
                    gameApi.getDailyQuests(),
                    gameApi.getMapData()
                ]);
                setLeaderboard(leaderboardRes.data);
                setDailyQuests(questsRes.data);

                // Calculate Topic Progress
                if (user && user.progress && mapRes.data) {
                    const mapData = mapRes.data; // Assuming mapData is array of regions
                    const calculatedProgress = mapData.map((region: any) => {
                        const totalLevels = region.levels.length;
                        const completedInRegion = user.progress.filter((p: any) =>
                            p.status === 'completed' &&
                            region.levels.some((l: any) => l.levelId === p.levelId)
                        ).length;

                        // Calculate stars
                        const starsInRegion = user.progress
                            .filter((p: any) => region.levels.some((l: any) => l.levelId === p.levelId))
                            .reduce((acc: number, curr: any) => acc + (curr.stars || 0), 0);

                        return {
                            id: region.regionId,
                            title: region.title,
                            // icon: region.icon,
                            progress: Math.round((completedInRegion / (totalLevels || 1)) * 100),
                            totalLevels,
                            completedLevels: completedInRegion,
                            stars: starsInRegion,
                            color: region.themeColor || 'blue' // Fallback
                        };
                    });
                    setTopicProgress(calculatedProgress);
                }

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        if (user) {
            loadDashboardData();
        }
    }, [user]);



    // Derived Stats from User Data
    const currentXP = user?.xp || 0;
    const currentLevel = Math.floor(currentXP / 100) + 1;
    const nextLevelXP = currentLevel * 60;
    const streakCount = user?.streak?.count || 1;
    const accuracy = user?.accuracy || 0;
    const badgesCount = user?.badges?.length || 0;

    const completedLevelsCount = user?.progress ? user.progress.filter(p => p.status === 'completed').length : 0;

    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        try {
            const res = await gameApi.submitFeedback(feedbackText);
            toast.success("Feedback sent! +5 XP");
            setFeedbackText("");
            setShowFeedback(false);

            // Update User State (XP / Level)
            updateUser({
                xp: res.data.xp,
                level: res.data.level
            });

            // Refresh quests? Ideally yes, or better, response returns new quests
            const questsRes = await gameApi.getDailyQuests();
            setDailyQuests(questsRes.data);
        } catch (error) {
            console.error("Feedback error", error);
            // toast.error("Failed to send feedback"); // handled by api interceptor
        }
    };

    return (
        <div className="space-y-6 relative"> {/* Replaced main with div since layout has main */}
            {/* Header */}
            <DashboardHeader
                username={user?.username || ''}
                currentXP={currentXP}
                currentLevel={currentLevel}
                avatarId={user?.avatarId || ''}
            />

            {/* Feedback Button */}
            <div className="absolute top-2 right-40 mt-2 mr-2">
                <button
                    onClick={() => setShowFeedback(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-primary font-bold hover:bg-gray-50 transition-colors"
                >
                    <MessageSquare size={18} />
                    Feedback
                </button>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowFeedback(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-display font-bold text-dark mb-4">Give Feedback</h3>
                        <p className="text-gray-500 text-sm mb-4">Tell us what you think about the game! You'll earn XP for your first feedback each day.</p>

                        <textarea
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none font-nunito"
                            rows={4}
                            placeholder="Type your feedback here..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        />

                        <div className="mt-4 flex justify-end">
                            <GameButton variant="primary" onClick={handleFeedbackSubmit} disabled={!feedbackText.trim()}>
                                <Send size={18} className="mr-2" />
                                Send Feedback
                            </GameButton>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Hero Avatar & Progress */}
                <motion.div
                    className="lg:col-span-2 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <HeroSection
                        avatarId={user?.avatarId || ''}
                        currentLevel={currentLevel}
                        currentXP={currentXP}
                        nextLevelXP={nextLevelXP}
                        completedLevelsCount={completedLevelsCount}
                        accuracy={accuracy}
                        badgesCount={badgesCount}
                        streakCount={streakCount}
                    />

                    {/* We need to pass real progress data here later, for now keeping it as is or passing user progress if component ready */}
                    <TopicProgressList topics={topicProgress} />
                </motion.div>

                {/* Right Column - Quests & Badges */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <DailyQuestsList quests={dailyQuests} />
                    <RecentBadgesList badges={user?.badges} />
                    <LeaderboardPreview players={leaderboard} />
                </motion.div>
            </div>
        </div>
        // </div >
    );
};

export default Dashboard;
