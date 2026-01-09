import { Request, Response } from 'express';
import User from '@/models/User.js';
import Challenge from '../models/Challenge.js';
import Level from '@/models/Level.js';
import { checkAndAdvanceQuest } from '@/services/quest.service.js';
import Region from '@/models/Region.js';

export const completeLevel = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { levelId, stars, solvedPuzzles } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Resolve Level _id
        const levelDoc = await Level.findOne({ levelId }); // Use findAll/One? Schema levelId is string "101"
        if (!levelDoc) return res.status(404).json({ message: 'Invalid Level ID' });
        const levelObjectId = levelDoc._id;

        const submittedPuzzles = Array.isArray(solvedPuzzles) ? solvedPuzzles : [];

        // Resolve Challenge IDs (Create if missing pattern)
        const challengeObjectIds: any[] = [];
        let puzzleXp = 0;

        for (const pid of submittedPuzzles) {
            let challenge = await Challenge.findOne({ challengeId: pid });
            if (!challenge) {
                // Determine type from string ID if possible or default
                let type = 'unknown';
                if (pid.includes('drag')) type = 'drag';
                else if (pid.includes('situation')) type = 'situation';
                else if (pid.includes('tap')) type = 'tap';
                else if (pid.includes('story')) type = 'story';
                else if (pid.includes('time')) type = 'time';
                else if (pid.includes('easy') || pid.includes('moderate') || pid.includes('hard')) type = 'puzzle'; // Fallback for pure maze puzzles

                challenge = await Challenge.create({
                    challengeId: pid,
                    type,
                    levelId: levelId // String ID reference
                });
            }
            challengeObjectIds.push(challenge._id);
        }

        // Convert user's previously solved to string array for easy check (ObjectIds)
        const previousParams = (user.solvedChallenges || []).map((id: any) => id.toString());
        const previousSet = new Set(previousParams);

        const newSolvedIds: any[] = [];

        // Identify NEW challenges
        for (let i = 0; i < submittedPuzzles.length; i++) {
            const rawId = submittedPuzzles[i];
            const objId = challengeObjectIds[i];

            if (!previousSet.has(objId.toString())) {
                newSolvedIds.push(objId);

                // XP Logic (based on string ID keywords)
                if (rawId.includes('easy')) puzzleXp += 1;
                else if (rawId.includes('moderate')) puzzleXp += 2;
                else if (rawId.includes('hard')) puzzleXp += 3;
                else puzzleXp += 1;
            }
        }

        const existingProgressIndex = user.progress.findIndex((p: any) => p.levelId.toString() === levelObjectId.toString());
        let xpAddedToUser = 0;

        if (existingProgressIndex > -1) {
            const prog = user.progress[existingProgressIndex];
            if (stars > prog.stars) {
                prog.stars = stars;
            }
            prog.xpEarned = (prog.xpEarned || 0) + puzzleXp;

            // Add new challenges to progress
            const progSet = new Set((prog.solvedChallenges || []).map((id: any) => id.toString()));
            newSolvedIds.forEach(id => progSet.add(id.toString()));
            // Cast back to ObjectId? Mongoose handles array of ID assignment usually if types match
            prog.solvedChallenges = Array.from(progSet) as any;

            prog.status = 'completed';
            prog.completedAt = new Date();
            xpAddedToUser = puzzleXp;

        } else {
            user.progress.push({
                levelId: levelObjectId,
                status: 'completed',
                stars,
                xpEarned: puzzleXp,
                solvedChallenges: challengeObjectIds, // specific to this run + pre-existing? No usually only submitted. 
                // Wait, if it's new progress, we just push the submitted ones? 
                // Correct.
                completedAt: new Date()
            });
            xpAddedToUser = puzzleXp;
        }

        user.xp += xpAddedToUser;
        user.level = Math.floor(user.xp / 100) + 1;

        newSolvedIds.forEach(id => user.solvedChallenges.push(id));
        user.totalStars = user.progress.reduce((acc, curr) => acc + curr.stars, 0);

        // Check if Level XP threshold is met for unlocking next level and quests
        // Re-find the updated/new progress entry to get total XP
        const currentLevelProgress = user.progress.find((p: any) => p.levelId.toString() === levelObjectId.toString());
        const totalLevelXp = currentLevelProgress ? currentLevelProgress.xpEarned : 0;

        if (totalLevelXp > 10) {
            // Next Level Unlock
            const nextLevelId = (parseInt(levelId) + 1).toString();
            const nextLevelDoc = await Level.findOne({ levelId: nextLevelId });

            if (nextLevelDoc) {
                const nextLevelObjId = nextLevelDoc._id.toString();
                // Check if already in progress
                if (!user.progress.find((p: any) => p.levelId.toString() === nextLevelObjId)) {
                    user.progress.push({
                        levelId: nextLevelDoc._id,
                        status: 'unlocked',
                        stars: 0,
                        xpEarned: 0,
                        solvedChallenges: []
                    });
                }
            }
            
            // Handle Quests using Service
            await checkAndAdvanceQuest(user, 'LEVELS_COMPLETED', 1);
            await checkAndAdvanceQuest(user, 'STARS_EARNED', stars);
        }
        if (solvedPuzzles.length > 0) {
            await checkAndAdvanceQuest(user, 'PUZZLES_COMPLETED', solvedPuzzles.length);
        }

        await user.save();

        res.json({
            message: 'Level completed',
            progress: user.progress,
            xp: user.xp,
            totalStars: user.totalStars,
            level: user.level,
            xpAwarded: xpAddedToUser
        });

    } catch (error) {
        console.error("Complete Level Error", error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

export const getLevel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const level = await Level.findOne({ levelId: id });
        if (!level) return res.status(404).json({ message: 'Level not found' });
        res.json(level);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching level' });
    }
};

export const getWorldMap = async (req: Request, res: Response) => {
    try {
        const regions = await Region.find().sort({ order: 1 });
        const levels = await Level.find().sort({ order: 1 });

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
