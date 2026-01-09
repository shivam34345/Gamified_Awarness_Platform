import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
    challengeId: string; // e.g., "101-drag-0"
    type: string; // 'drag', 'time', etc.
    levelId: string;
}

const ChallengeSchema: Schema = new Schema({
    challengeId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    levelId: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
