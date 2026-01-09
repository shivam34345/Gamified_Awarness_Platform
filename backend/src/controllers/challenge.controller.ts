import { Request, Response } from 'express';
import Challenge from '../models/Challenge.js';
import Level from '../models/Level.js';
import User from '@/models/User.js';

export const awardChallengeXP = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { levelId, gameType, challengeIndex } = req.body;

        // 1. Resolve Level _id
        const levelDoc = await Level.findOne({ levelId }); // levelId string "101"
        if (!levelDoc) return res.status(404).json({ message: 'Level not found' });
        const levelObjectId = levelDoc._id;

        const challengeIdString = `${levelId}-${gameType}-${challengeIndex}`;

        // 2. Resolve/Create Challenge _id
        let challenge = await Challenge.findOne({ challengeId: challengeIdString });
        if (!challenge) {
            challenge = await Challenge.create({
                challengeId: challengeIdString,
                type: gameType,
                levelId
            });
        }
        const challengeObjectId = challenge._id;


        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if already solved (ObjectId comparison)
        if (user.solvedChallenges && user.solvedChallenges.some((id: any) => id.toString() === challengeObjectId.toString())) {
            return res.json({ message: 'Challenge already solved', xpAwarded: 0, xp: user.xp });
        }

        let xpAwarded = 0;
        switch (gameType) {
            case 'drag':
            case 'tap':
                xpAwarded = 1;
                break;
            case 'situation':
            case 'time':
                xpAwarded = 2;
                break;
            case 'story':
                xpAwarded = 3;
                break;
            default:
                xpAwarded = 1;
        }

        // Find Progress by Level ObjectId
        const existingProgressIndex = user.progress.findIndex((p: any) => p.levelId.toString() === levelObjectId.toString());

        if (existingProgressIndex > -1) {
            user.progress[existingProgressIndex].xpEarned = (user.progress[existingProgressIndex].xpEarned || 0) + xpAwarded;

            if (!user.progress[existingProgressIndex].solvedChallenges) {
                user.progress[existingProgressIndex].solvedChallenges = [];
            }
            if (!user.progress[existingProgressIndex].solvedChallenges.some((id: any) => id.toString() === challengeObjectId.toString())) {
                user.progress[existingProgressIndex].solvedChallenges.push(challengeObjectId);
            }

        } else {
            user.progress.push({
                levelId: levelObjectId,
                status: 'unlocked', // Or 'completed' if this was the last thing? Assume unlocked.
                stars: 0,
                xpEarned: xpAwarded,
                solvedChallenges: [challengeObjectId],
                completedAt: undefined
            });
        }

        if (!user.solvedChallenges) user.solvedChallenges = [];
        user.solvedChallenges.push(challengeObjectId);

        let calculatedXp = user.progress.reduce((acc: number, curr: any) => acc + (curr.xpEarned || 0), 0);
        calculatedXp += user.dailyQuests.reduce((acc: number, curr: any) => acc + (curr.xpReward || 0), 0);
        user.xp = calculatedXp;

        user.level = Math.floor(user.xp / 100) + 1;

        await user.save();

        res.json({
            message: 'Challenge XP awarded',
            xpAwarded,
            xp: user.xp,
            level: user.level
        });

    } catch (error) {
        console.error("Award Challenge XP Error", error);
        res.status(500).json({ message: 'Error awarding XP' });
    }
};
