import type { Request, Response } from 'express';
import User from '../models/User.js';
import Level from '../models/Level.js';
import Region from '../models/Region.js';
import Quest from '../models/Quest.js';

// Helper to advance quest logic
const checkAndAdvanceQuest = async (user: any, criteriaType: string, amount: number = 1) => {
    let questUpdated = false;
    const currentQuestIds = user.dailyQuests.map((q: any) => q.questId);
    const questDefs = await Quest.find({ questId: { $in: currentQuestIds } });

    for (const uq of user.dailyQuests) {
        if (uq.isClaimed) continue;

        const def = questDefs.find(d => d.questId === uq.questId);
        if (!def) continue;

        if (def.criteria.type === criteriaType) {
            uq.progress += amount;

            // Check completion and claim immediately if finished
            if (uq.progress <= def.criteria.target && !uq.isClaimed) {
                uq.isClaimed = true;
                user.xp += def.xpReward; // Award Quest XP
                // Recalculate level
                questUpdated = true;
            } else {
                questUpdated = true; // Just progress update
            }
        }
    }
    return questUpdated;
};

// ... (existing submitFeedback and completePuzzle remain same, they use checkAndAdvanceQuest so they benefit from the fix) ...

// Complete a Level
export const completeLevel = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { levelId, stars } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if already completed
        const existingProgressIndex = user.progress.findIndex(p => p.levelId === levelId);
        let xpAwarded = 0;

        if (existingProgressIndex > -1) {
            const oldStars = user.progress[existingProgressIndex]!.stars;

            // Update stars if higher
            if (stars > oldStars) {
                user.progress[existingProgressIndex]!.stars = stars;
                // Improvement Reward: 5 XP
                xpAwarded = 5;
                user.xp += xpAwarded;
            } else {
                // No improvement, no XP
                xpAwarded = 0;
            }
            user.progress[existingProgressIndex]!.status = 'completed';
        } else {
            // New completion
            user.progress.push({
                levelId,
                status: 'completed',
                stars,
                completedAt: new Date()
            });
            // New Completion Reward: 5 XP
            xpAwarded = 5;
            user.xp += xpAwarded;
        }

        // Unlock next level logic? 
        // For simplicity, let's say completing 101 unlocks 102.
        const nextLevelId = (parseInt(levelId) + 1).toString();
        const hasNext = await Level.findOne({ levelId: nextLevelId });

        if (hasNext) {
            const nextProgressIndex = user.progress.findIndex(p => p.levelId === nextLevelId);
            if (nextProgressIndex === -1) {
                user.progress.push({
                    levelId: nextLevelId,
                    status: 'unlocked',
                    stars: 0
                });
            }
        }

        // Update Daily Quests
        const questIds = user.dailyQuests.map(q => q.questId);
        const questDefs = await Quest.find({ questId: { $in: questIds } });

        let questUpdated = false;

        // We use a manual loop here similar to checkAndAdvanceQuest to ensure we capture all updates
        for (const uq of user.dailyQuests) {
            if (uq.isClaimed) continue;

            const def = questDefs.find(d => d.questId === uq.questId);
            if (!def) continue;

            let progressMade = false;

            if (def.criteria.type === 'LEVELS_COMPLETED') {
                uq.progress += 1;
                progressMade = true;
            } else if (def.criteria.type === 'STARS_EARNED') {
                uq.progress += stars; // Add the stars earned in this level
                progressMade = true;
            }

            if (progressMade) {
                // Check completion
                if (uq.progress >= def.criteria.target && !uq.isClaimed) {
                    uq.isClaimed = true;
                    user.xp += def.xpReward; // Award Quest XP
                }
                questUpdated = true;
            }
        }

        // Quick recalc total stars to be safe
        user.totalStars = user.progress.reduce((acc, curr) => acc + curr.stars, 0);

        // Calculate Level
        user.level = Math.floor(user.xp / 100) + 1;

        await user.save();
        res.json({ message: 'Level completed', progress: user.progress, xp: user.xp, totalStars: user.totalStars, level: user.level, xpAwarded });

    } catch (error) {
        console.error("Complete Level Error", error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

// Submit Feedback
export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { message } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updated = await checkAndAdvanceQuest(user, 'FEEDBACK_GIVEN', 1);
        if (updated) await user.save();

        res.json({
            message: 'Feedback received',
            dailyQuests: user.dailyQuests,
            xp: user.xp,
            level: user.level
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback' });
    }
};

// Complete Puzzle
export const completePuzzle = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { solvedPuzzles } = req.body; // Expecting array of strings ['easy-1', 'hard-2']

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!Array.isArray(solvedPuzzles)) {
            return res.status(400).json({ message: 'solvedPuzzles must be an array' });
        }

        // Filter out puzzles that are already in user.solvedPuzzles
        const previouslySolvedSet = new Set(user.solvedPuzzles || []);
        const newPuzzles = solvedPuzzles.filter(pid => !previouslySolvedSet.has(pid));

        let xpGained = 0;

        newPuzzles.forEach(pid => {
            // Determine difficulty from ID structure (e.g. 'easy-1', 'moderate-3')
            // Default to 1 if unknown
            if (pid.startsWith('easy')) {
                xpGained += 1;
            } else if (pid.startsWith('moderate')) {
                xpGained += 2;
            } else if (pid.startsWith('hard')) {
                xpGained += 3;
            } else {
                xpGained += 1; // Fallback
            }

            // Add to user history
            user.solvedPuzzles.push(pid);
        });

        // Award XP
        if (xpGained > 0) {
            user.xp += xpGained;
            // Recalculate level
            user.level = Math.floor(user.xp / 100) + 1;
        }

        // Update Quest (Count newly solved only? Or all submitted? 
        // Usually, quest tracks "Solve 5 puzzles". 
        // If we only count new ones, we pass newPuzzles.length)
        let questUpdated = false;
        if (newPuzzles.length > 0) {
            questUpdated = await checkAndAdvanceQuest(user, 'PUZZLES_COMPLETED', newPuzzles.length);
        }

        if (xpGained > 0 || questUpdated) {
            await user.save();
        }

        res.json({
            message: 'Puzzles processed',
            xpAwarded: xpGained,
            dailyQuests: user.dailyQuests,
            xp: user.xp,
            level: user.level,
            newlySolved: newPuzzles
        });
    } catch (error) {
        console.error("Complete Puzzle Error", error);
        res.status(500).json({ message: 'Error completing puzzle' });
    }
};

// Get Leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
            .sort({ totalStars: -1, xp: -1 })
            .limit(10)
            .select('username avatarId totalStars xp');

        // Map to simpler format if needed, but frontend can handle this
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

// Get Daily Quests
export const getDailyQuests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Fetch definitions for CURRENT assigned quests to know their types
        const currentQuestIds = user.dailyQuests.map(q => q.questId);
        const currentQuestDefs = await Quest.find({ questId: { $in: currentQuestIds } });

        // Check if quests need to be refreshed (e.g., new day)
        const today = new Date();
        const lastLogin = new Date(user.streak.lastLogin); // Caution: this might be updated on login, checking against assignedAt closer?

        // Better check: Check if we have any DAILY quests assigned TODAY
        const hasDailyForToday = user.dailyQuests.some(uq => {
            const def = currentQuestDefs.find(d => d.questId === uq.questId);
            if (def?.type !== 'DAILY') return false;

            const assigned = new Date(uq.assignedAt);
            return assigned.getDate() === today.getDate() && assigned.getMonth() === today.getMonth() && assigned.getFullYear() === today.getFullYear();
        });

        if (!hasDailyForToday) {
            // Need to generate new DAILY quests
            // 1. Remove old DAILY quests
            // Keep quests that are NOT daily (Weekly, Achievement, or if def missing/unknown keep safe?)
            // We only keep known non-daily. 
            let newQuestList = user.dailyQuests.filter(uq => {
                const def = currentQuestDefs.find(d => d.questId === uq.questId);
                return def && def.type !== 'DAILY';
            });

            // 2. Fetch 3 new random DAILY quests
            const newDailyQuests = await Quest.aggregate([{ $match: { type: 'DAILY' } }, { $sample: { size: 3 } }]);

            const newAssigned = newDailyQuests.map(q => ({
                questId: q.questId,
                progress: 0,
                isClaimed: false,
                assignedAt: new Date()
            }));

            user.dailyQuests = [...newQuestList, ...newAssigned];
            await user.save();
        }

        // 2. Ensure WEEKLY / ACHIEVEMENT quests are assigned if available
        // Fetch all generic WEEKLY/ACHIEVEMENT quests
        const globalQuests = await Quest.find({ type: { $in: ['WEEKLY', 'ACHIEVEMENT'] } });

        let addedNew = false;
        for (const gq of globalQuests) {
            const exists = user.dailyQuests.some(uq => uq.questId === gq.questId);
            if (!exists) {
                user.dailyQuests.push({
                    questId: gq.questId,
                    progress: 0,
                    isClaimed: false,
                    assignedAt: new Date()
                });
                addedNew = true;
            }
        }

        if (addedNew) await user.save();


        // 3. Return full details
        // Re-fetch ids in case we added some
        const finalQuestIds = user.dailyQuests.map(q => q.questId);
        const finalDefs = await Quest.find({ questId: { $in: finalQuestIds } });

        const detailedQuests = user.dailyQuests.map(uq => {
            const def = finalDefs.find(d => d.questId === uq.questId);
            if (!def) return null; // Should not happen often, but filter out

            // 4. "Send only current day quest"
            // If it is DAILY, it MUST be from today (logic above ensures old dailies are removed/replaced).
            // So we just return everything in user.dailyQuests now.

            // Check implicit "if any" - logic simply returns what's there.
            return {
                questId: uq.questId,
                title: def.title,
                description: def.description,
                xpReward: def.xpReward,
                progress: uq.progress,
                max: def.criteria.target,
                icon: def.criteria.type,
                type: def.type // Useful for frontend to group headers
            };
        }).filter(q => q !== null);
        res.json(detailedQuests);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching daily quests' });
    }
};


// Get the full world map (Regions + Levels)
export const getWorldMap = async (req: Request, res: Response) => {
    try {
        const regions = await Region.find().sort({ order: 1 });
        const levels = await Level.find().sort({ order: 1 });

        // Group levels by region
        const mapData = regions.map(region => {
            return {
                ...region.toObject(),
                levels: levels.filter(l => l.regionId === region.regionId)
            };
        });

        res.json(mapData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching map data' });
    }
};

// Get User Progress
export const getUserProgress = async (req: Request, res: Response) => {
    try {
        // req.user is set by auth middleware (need to implement middleware)
        // For now assuming req.user.id exists
        const userId = (req as any).user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress' });
    }
};

