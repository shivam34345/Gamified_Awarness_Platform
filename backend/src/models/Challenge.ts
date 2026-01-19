import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChallenge extends Document {
    type: string;
    levelId: mongoose.Types.ObjectId;
    data: any;
    xp: number;
    title: string;
    description: string;
    video?: string;
    references?: { title: string; url: string }[];
    sticker?: string;
}

const ChallengeSchema: Schema = new Schema({
    type: { type: String, required: true },
    gameType: { type: String, required: true }, // Specific renderer type
    levelId: { type: mongoose.Types.ObjectId, ref: 'Level', required: true },
    lawId: { type: String }, // Topic identifier
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    badge: { type: String }, // Optional badge award
    order: { type: Number, default: 0 },
    data: { type: Schema.Types.Mixed, required: true },
    xp: { type: Number, required: true, default: 10 },
    title: { type: String, required: true },
    description: { type: String },
    video: { type: String }, // URL
    references: [{ title: String, url: String }],
    sticker: { type: String } // URL or asset path
}, {
    timestamps: true
});

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
