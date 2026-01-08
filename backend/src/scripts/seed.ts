import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Region from '../models/Region.js';
import Level from '../models/Level.js';
import connectDB from '../config/db.js';

dotenv.config();

const SEED_DATA = [
    {
        id: 'rti',
        title: "Right to Information",
        description: "Learn how to access public information.",
        themeColor: "#3b82f6",
        bgGradient: "from-blue-50/50 to-blue-100/30",
        order: 1,
        levels: [
            { levelId: "101", title: "Quest Begins", x: 50, y: 10 },
            { levelId: "102", title: "The Filing", x: 25, y: 30 },
            { levelId: "103", title: "Bureaucracy", x: 75, y: 50 },
            { levelId: "104", title: "Transparency", x: 35, y: 70 },
            { levelId: "105", title: "Knowledge Power", x: 65, y: 90 },
        ]
    },
    {
        id: 'rtbn',
        title: "Right to Basic Needs",
        description: "Understand the fundamental rights to survival.",
        themeColor: "#10b981",
        bgGradient: "from-emerald-50/50 to-emerald-100/30",
        order: 2,
        levels: [
            { levelId: "201", title: "Water Crisis", x: 45, y: 10 },
            { levelId: "202", title: "Food Security", x: 80, y: 30 },
            { levelId: "203", title: "Shelter", x: 20, y: 50 },
            { levelId: "204", title: "Healthcare", x: 60, y: 70 },
            { levelId: "205", title: "Dignity", x: 40, y: 90 },
        ]
    },
    {
        id: 'rts',
        title: "Right to Speak",
        description: "Explore freedom of speech and expression.",
        themeColor: "#f59e0b",
        bgGradient: "from-amber-50/50 to-amber-100/30",
        order: 3,
        levels: [
            { levelId: "301", title: "Voice Up", x: 70, y: 10 },
            { levelId: "302", title: "Debate", x: 30, y: 30 },
            { levelId: "303", title: "Expression", x: 85, y: 50 },
            { levelId: "304", title: "The Press", x: 15, y: 70 },
            { levelId: "305", title: "Freedom", x: 50, y: 90 },
        ]
    },
    {
        id: 'identity-island',
        title: "Identity Island",
        description: "Discover the importance of your name and nationality.",
        themeColor: "#0ea5e9", // Sky Blue
        bgGradient: "from-sky-50/50 to-sky-100/30",
        order: 4,
        levels: [
            { levelId: "401", title: "Who Am I?", x: 20, y: 10 },
            { levelId: "402", title: "My Name", x: 60, y: 30 },
            { levelId: "403", title: "Citizenship", x: 85, y: 50 },
            { levelId: "404", title: "Belonging", x: 40, y: 70 },
            { levelId: "405", title: "My Roots", x: 15, y: 90 },
        ]
    },
    {
        id: 'family-forest',
        title: "Family Forest",
        description: "Grow in a loving and supportive environment.",
        themeColor: "#22c55e", // Green
        bgGradient: "from-green-50/50 to-green-100/30",
        order: 5,
        levels: [
            { levelId: "501", title: "Family Tree", x: 70, y: 10 },
            { levelId: "502", title: "Care & Love", x: 30, y: 30 },
            { levelId: "503", title: "Reunion", x: 10, y: 50 },
            { levelId: "504", title: "Support", x: 50, y: 70 },
            { levelId: "505", title: "Harmony", x: 80, y: 90 },
        ]
    },
    {
        id: 'health-haven',
        title: "Health Haven",
        description: "Learn about wellness, nutrition, and healthcare.",
        themeColor: "#ef4444", // Red
        bgGradient: "from-red-50/50 to-red-100/30",
        order: 6,
        levels: [
            { levelId: "601", title: "Checkup", x: 40, y: 10 },
            { levelId: "602", title: "Nutrition", x: 80, y: 30 },
            { levelId: "603", title: "Hygiene", x: 50, y: 50 },
            { levelId: "604", title: "Exercise", x: 20, y: 70 },
            { levelId: "605", title: "Wellbeing", x: 60, y: 90 },
        ]
    },
    {
        id: 'education-empire',
        title: "Education Empire",
        description: "Build your future through learning and school.",
        themeColor: "#eab308", // Yellow
        bgGradient: "from-yellow-50/50 to-yellow-100/30",
        order: 7,
        levels: [
            { levelId: "701", title: "School Day", x: 30, y: 10 },
            { levelId: "702", title: "Teachers", x: 70, y: 30 },
            { levelId: "703", title: "Library", x: 20, y: 50 },
            { levelId: "704", title: "Science Lab", x: 60, y: 70 },
            { levelId: "705", title: "Graduation", x: 90, y: 90 },
        ]
    },
    {
        id: 'equality-expanse',
        title: "Equality Expanse",
        description: "Understand fairness and non-discrimination.",
        themeColor: "#a855f7", // Purple
        bgGradient: "from-purple-50/50 to-purple-100/30",
        order: 8,
        levels: [
            { levelId: "801", title: "Fair Play", x: 50, y: 10 },
            { levelId: "802", title: "No Bullying", x: 20, y: 30 },
            { levelId: "803", title: "Inclusion", x: 80, y: 50 },
            { levelId: "804", title: "Respect", x: 40, y: 70 },
            { levelId: "805", title: "Unity", x: 60, y: 90 },
        ]
    },
    {
        id: 'privacy-peak',
        title: "Privacy Peak",
        description: "Protect your personal space and information.",
        themeColor: "#6366f1", // Indigo
        bgGradient: "from-indigo-50/50 to-indigo-100/30",
        order: 9,
        levels: [
            { levelId: "901", title: "My Diary", x: 75, y: 10 },
            { levelId: "902", title: "Online Safety", x: 35, y: 30 },
            { levelId: "903", title: "Secrets", x: 65, y: 50 },
            { levelId: "904", title: "Boundaries", x: 20, y: 70 },
            { levelId: "905", title: "Security", x: 50, y: 90 },
        ]
    },
    {
        id: 'protection-paladin',
        title: "Protection Paladin",
        description: "Learn about safety from harm and exploitation.",
        themeColor: "#64748b", // Slate/Silver
        bgGradient: "from-slate-50/50 to-slate-100/30",
        order: 10,
        levels: [
            { levelId: "1001", title: "Safe Circle", x: 30, y: 10 },
            { levelId: "1002", title: "Say No", x: 70, y: 30 },
            { levelId: "1003", title: "Help Line", x: 40, y: 50 },
            { levelId: "1004", title: "Guardian", x: 80, y: 70 },
            { levelId: "1005", title: "Shield", x: 50, y: 90 },
        ]
    },
    {
        id: 'peace-pavilion',
        title: "Peace Pavilion",
        description: "Promote harmony and conflict resolution.",
        themeColor: "#0ea5e9", // Light Blue/White (using Sky for visibility)
        bgGradient: "from-cyan-50/50 to-cyan-100/30",
        order: 11,
        levels: [
            { levelId: "1101", title: "Calm Mind", x: 60, y: 10 },
            { levelId: "1102", title: "Dialogue", x: 20, y: 30 },
            { levelId: "1103", title: "Friendship", x: 80, y: 50 },
            { levelId: "1104", title: "Tolerance", x: 40, y: 70 },
            { levelId: "1105", title: "Harmony", x: 70, y: 90 },
        ]
    },
    {
        id: 'justice-jungle',
        title: "Justice Jungle",
        description: "Stand up for what is right and fair.",
        themeColor: "#f97316", // Orange
        bgGradient: "from-orange-50/50 to-orange-100/30",
        order: 12,
        levels: [
            { levelId: "1201", title: "The Rules", x: 40, y: 10 },
            { levelId: "1202", title: "Fair Trial", x: 80, y: 30 },
            { levelId: "1203", title: "Advocacy", x: 30, y: 50 },
            { levelId: "1204", title: "Rights", x: 70, y: 70 },
            { levelId: "1205", title: "Verdict", x: 50, y: 90 },
        ]
    },
    {
        id: 'dream-domain',
        title: "Dream Domain",
        description: "Imagine a better future for every child.",
        themeColor: "#ec4899", // Pink
        bgGradient: "from-pink-50/50 to-pink-100/30",
        order: 13,
        levels: [
            { levelId: "1301", title: "My Hope", x: 25, y: 10 },
            { levelId: "1302", title: "Innovation", x: 65, y: 30 },
            { levelId: "1303", title: "Leadership", x: 90, y: 50 },
            { levelId: "1304", title: "Change", x: 35, y: 70 },
            { levelId: "1305", title: "Future", x: 75, y: 90 },
        ]
    }
];

import Quest from '../models/Quest.js';

// ... (previous imports)

const SEED_QUESTS = [
    {
        questId: "daily_level_1",
        title: "Level Master",
        description: "Complete 1 level today",
        xpReward: 5,
        type: "DAILY",
        criteria: { type: "LEVELS_COMPLETED", target: 1 }
    },
    {
        questId: "daily_feedback_1",
        title: "Voice of Hero",
        description: "Give feedback once today",
        xpReward: 5,
        type: "DAILY",
        criteria: { type: "FEEDBACK_GIVEN", target: 1 }
    },
    {
        questId: "daily_puzzle_1",
        title: "Puzzle Solver",
        description: "Solve 5 puzzles today",
        xpReward: 10,
        type: "DAILY",
        criteria: { type: "PUZZLES_COMPLETED", target: 5 }
    }
];

// ... (SEED_DATA)

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        console.log('Clearing old data...');
        await Region.deleteMany({});
        await Level.deleteMany({});
        await Quest.deleteMany({});

        console.log('Seeding data...');
        // ... (Region and Level seeding)

        // Create Quests
        for (const questData of SEED_QUESTS) {
            const quest = new Quest(questData);
            await quest.save();
            console.log(`Created Quest: ${quest.title}`);
        }

        for (const regionData of SEED_DATA) {
            // ... (Region creation)
            const region = new Region({
                regionId: regionData.id,
                title: regionData.title,
                description: regionData.description,
                themeColor: regionData.themeColor,
                order: regionData.order
            });
            await region.save();
            console.log(`Created Region: ${region.title}`);

            // Create Levels
            let levelOrder = 1;
            for (const levelData of regionData.levels) {
                const level = new Level({
                    levelId: levelData.levelId,
                    title: levelData.title,
                    regionId: regionData.id,
                    difficulty: 'EASY', // Default
                    order: levelOrder++,
                    x: levelData.x,
                    y: levelData.y,
                    config: {
                        gridSize: 10,
                        timeLimit: 120,
                        minStarsThreshold: 1
                    }
                });
                await level.save();
            }
            console.log(`Created ${regionData.levels.length} levels for ${region.title}`);
        }

        console.log('Seeding Complete! 🌱');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seed();
