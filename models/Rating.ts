import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  targetType: 'project' | 'file';
  targetId: string;
  accountId: string;
  score: number; // 1-5
  createdAt: Date;
}

const RatingSchema: Schema = new Schema(
  {
    targetType: { type: String, enum: ['project', 'file'], required: true },
    targetId: { type: String, required: true },
    accountId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// one rating per user per target
RatingSchema.index({ targetType: 1, targetId: 1, accountId: 1 }, { unique: true });

const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema, 'nova-browser_ratings');

export default Rating;
