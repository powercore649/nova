import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepo extends Document {
  name: string;
  description: string;
  ownerName: string;
  ownerId: string;
  visibility: 'public' | 'private';
  readme: string;
  defaultBranch: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepoSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    ownerName: { type: String, required: true },
    ownerId: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    readme: { type: String, default: '' },
    defaultBranch: { type: String, default: 'main' },
    stars: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RepoSchema.index({ ownerName: 1, name: 1 }, { unique: true });
RepoSchema.index({ visibility: 1, createdAt: -1 });

const Repo: Model<IRepo> =
  mongoose.models.Repo || mongoose.model<IRepo>('Repo', RepoSchema, 'nova-browser_repos');

export default Repo;
