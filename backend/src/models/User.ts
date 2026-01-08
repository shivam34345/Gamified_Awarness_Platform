import mongoose, { Schema, Document } from 'mongoose';

export interface ILevelProgress {
    levelId: string;
    status: 'locked' | 'unlocked' | 'completed';
    stars: number;
    completedAt?: Date;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    avatarId: string;
    progress: ILevelProgress[];
    currentRegion: string;
    totalStars: number;
    xp: number;
    level: number;
    accuracy: number;
    badges: string[];
    streak: {
        count: number;
        lastLogin: Date;
    };
    dailyQuests: {
        questId: string;
        progress: number;
        isClaimed: boolean;
        assignedAt: Date;
    }[];
    solvedPuzzles: string[];
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatarId: { type: String, default: '1' },
    progress: [{
        levelId: { type: String, required: true },
        status: { type: String, enum: ['locked', 'unlocked', 'completed'], default: 'locked' },
        stars: { type: Number, default: 0 },
        completedAt: { type: Date }
    }],
    currentRegion: { type: String, default: 'rti' },
    totalStars: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    accuracy: { type: Number, default: 0 },
    badges: [{ type: String }],
    streak: {
        count: { type: Number, default: 1 },
        lastLogin: { type: Date, default: Date.now }
    },
    dailyQuests: [{
        questId: { type: String },
        progress: { type: Number, default: 0 },
        isClaimed: { type: Boolean, default: false },
        assignedAt: { type: Date, default: Date.now }
    }],
    solvedPuzzles: [{ type: String }]
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
