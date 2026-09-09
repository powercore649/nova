import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepoCommit extends Document {
  repoId: string;
  message: string;
  uploaderName: string;
  uploaderId: string;
  filesChanged: string[];   // array of paths
  filesAdded: number;
  filesModified: number;
  filesDeleted: number;
  sha: string;              // random hex string (simulated)
  createdAt: Date;
}

const RepoCommitSchema: Schema = new Schema(
  {
    repoId: { type: String, required: true },
    message: { type: String, required: true, maxlength: 200 },
    uploaderName: { type: String, default: 'Anonymous' },
    uploaderId: { type: String, default: '' },
    filesChanged: { type: [String], default: [] },
    filesAdded: { type: Number, default: 0 },
    filesModified: { type: Number, default: 0 },
    filesDeleted: { type: Number, default: 0 },
    sha: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RepoCommitSchema.index({ repoId: 1, createdAt: -1 });

const RepoCommit: Model<IRepoCommit> =
  mongoose.models.RepoCommit ||
  mongoose.model<IRepoCommit>('RepoCommit', RepoCommitSchema, 'nova-browser_repo_commits');

export default RepoCommit;
