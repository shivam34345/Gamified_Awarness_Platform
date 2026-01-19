import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Region from '../models/Region.js';
import Level from '../models/Level.js';
import Challenge from '../models/Challenge.js';
import connectDB from '../config/db.js';
import SEED_DATA from './data.js';

dotenv.config();

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('Clearing old data...');
        try {

        } catch (e) {
            console.log(e);
        }

        await Region.deleteMany({});
        await Level.deleteMany({});
        await Challenge.deleteMany({});

        console.log('Seeding data...');

        let globalLevelCounter = 1;

        for (const regionData of SEED_DATA) {
            const region = new Region({
                title: regionData.title,
                description: regionData.description,
                themeColor: regionData.themeColor,
                bgGradient: regionData.bgGradient,
                order: regionData.order,
                levels: [] // Initialize empty array
            });
            await region.save();
            console.log(`Created Region: ${region.title}`);

            const regionLevels: mongoose.Types.ObjectId[] = [];

            for (const levelData of regionData.levels) {
                const level = new Level({
                    levelNumber: globalLevelCounter++,
                    title: levelData.title,
                    regionId: region._id,
                    difficulty: 'EASY',
                    order: globalLevelCounter - 1,
                    x: levelData.x,
                    y: levelData.y,
                    config: {
                        gridSize: 10,
                        timeLimit: 120,
                        minStarsThreshold: 1
                    }
                });
                await level.save();
                regionLevels.push(level._id as mongoose.Types.ObjectId);

                // Seed Challenges for this level
                // Seed Challenges for this level
                const challengesData = (levelData as any).challenges;

                if (challengesData && Array.isArray(challengesData)) {
                    for (const cData of challengesData) {
                        const { type, gameType, lawId, difficulty, badge, order, xp, title, description, video, references, sticker } = cData;

                        const challenge = new Challenge({
                            type: type,
                            gameType: gameType || type,
                            levelId: level._id,
                            lawId,
                            difficulty,
                            badge,
                            order,
                            xp: xp || 10,
                            title: title || "Challenge", // Default title if missing
                            description,
                            video,
                            references,
                            sticker,
                            data: cData // Store full object in mixed field for flexibility
                        });
                        await challenge.save();
                    }
                } else {
                    // Legacy 'games' object support
                    const gamesData = (levelData as any).games;
                    if (gamesData) {
                        for (const [gameType, challenges] of Object.entries(gamesData)) {
                            if (Array.isArray(challenges)) {
                                for (const challengeItem of challenges) {
                                    const challenge = new Challenge({
                                        type: gameType,
                                        gameType: gameType, // Fallback
                                        levelId: level._id,
                                        data: challengeItem,
                                        xp: challengeItem.xp || 10,
                                        title: challengeItem.title || challengeItem.q || "Challenge", // Fallback to question or default
                                        description: challengeItem.description,
                                        video: challengeItem.video,
                                        references: challengeItem.references,
                                        sticker: challengeItem.sticker
                                    });
                                    await challenge.save();
                                }
                            }
                        }
                    }
                }
            }

            // Update region with level IDs
            region.levels = regionLevels as any;
            await region.save();

            console.log(`Linked ${regionLevels.length} levels to Region: ${region.title}`);
        }

        console.log('Seeding Complete! 🌱');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        console.error((error as any).stack);
        process.exit(1);
    }
};

seed();
