import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    targetType: 'project' | 'file';
    targetId: string;
    accountId: string;
    username: string;
    text: string;
    createdAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        targetType: { type: String, enum: ['project', 'file'], required: true },
        targetId: { type: String, required: true },
        accountId: { type: String, required: true },
        username: { type: String, required: true },
        text: { type: String, required: true, maxlength: 1000 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

CommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

const Comment: Model<IComment> =
    mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema, 'nova-browser_comments');

export default Comment;
