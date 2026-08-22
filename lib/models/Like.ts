import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILike extends Document {
    targetType: 'project' | 'file';
    targetId: string;
    accountId: string;
    createdAt: Date;
}

const LikeSchema: Schema = new Schema(
    {
        targetType: { type: String, enum: ['project', 'file'], required: true },
        targetId: { type: String, required: true },
        accountId: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per account per target
LikeSchema.index({ targetType: 1, targetId: 1, accountId: 1 }, { unique: true });

const Like: Model<ILike> =
    mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema, 'nova-browser_likes');

export default Like;
