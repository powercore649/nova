import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description: string;
  accountId: string;
  username: string;
  projectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    accountId: { type: String, required: true },
    username: { type: String, required: true },
    projectIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

CollectionSchema.index({ accountId: 1, createdAt: -1 });

const Collection: Model<ICollection> =
  mongoose.models.Collection ||
  mongoose.model<ICollection>('Collection', CollectionSchema, 'nova-browser_collections');

export default Collection;
