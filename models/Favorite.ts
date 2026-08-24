import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavorite extends Document {
    targetType: 'project' | 'file';
    targetId: string;
    accountId: string;
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
    {
        targetType: { type: String, enum: ['project', 'file'], required: true },
        targetId: { type: String, required: true },
        accountId: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// One favorite per account per target
FavoriteSchema.index({ targetType: 1, targetId: 1, accountId: 1 }, { unique: true });

const Favorite: Model<IFavorite> =
    mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema, 'nova-browser_favorites');

export default Favorite;
