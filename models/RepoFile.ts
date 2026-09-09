import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepoFile extends Document {
  repoId: string;
  path: string;       // e.g. "src/utils/helper.ts"
  name: string;       // e.g. "helper.ts"
  folder: string;     // e.g. "src/utils"
  content: string;    // base64 data URL OR raw text
  size: number;
  mimeType: string;
  isText: boolean;
  commitMessage: string;
  uploaderName: string;
  uploaderId: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepoFileSchema: Schema = new Schema(
  {
    repoId: { type: String, required: true },
    path: { type: String, required: true },
    name: { type: String, required: true },
    folder: { type: String, default: '' },
    content: { type: String, required: true },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
    isText: { type: Boolean, default: false },
    commitMessage: { type: String, default: 'Add file', maxlength: 200 },
    uploaderName: { type: String, default: 'Anonymous' },
    uploaderId: { type: String, default: '' },
  },
  { timestamps: true }
);

// Unique: one file per path per repo (latest wins on update)
RepoFileSchema.index({ repoId: 1, path: 1 });
RepoFileSchema.index({ repoId: 1, folder: 1 });

const RepoFile: Model<IRepoFile> =
  mongoose.models.RepoFile ||
  mongoose.model<IRepoFile>('RepoFile', RepoFileSchema, 'nova-browser_repo_files');

export default RepoFile;
