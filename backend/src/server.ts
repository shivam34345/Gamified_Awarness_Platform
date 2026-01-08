import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import gameRoutes from './routes/game.routes.js';
import { initDailyQuestsJob } from './jobs/dailyQuests.job.js';
import cookieParser from "cookie-parser";
dotenv.config();

// Initialize Cron Jobs
initDailyQuestsJob();
// Run once on startup to ensure quests exist during dev

async function startServer() {
    try {
        await connectDB();

        const app = express();
        const PORT = process.env.PORT || 5000;

        // Middleware
        app.use(cors({
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true
        }));
        app.use(express.json());
        app.use(cookieParser());

        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/game', gameRoutes);


        app.get('/', (req: Request, res: Response) => {
            res.json({ message: 'Welcome to EduRights API 🚀' });
        });

        app.get('/health', (req: Request, res: Response) => {
            res.json({ status: 'OK', timestamp: new Date() });
        });

        // Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }

}

startServer();
