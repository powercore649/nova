import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserFileStatus = 'pending' | 'approved' | 'rejected';

export interface IUserFile extends Document {
  originalName: string;
  fileUrl: string;
  fileType: 'image' | 'zip';
  mimeType: string;
  fileSize: number;
  thumbnailUrl: string;
  uploaderName: string;
  uploaderNote: string;
  status: UserFileStatus;
  reviewNote: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserFileSchema: Schema = new Schema(
  {
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'zip'], required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    thumbnailUrl: { type: String, default: '' },
    uploaderName: { type: String, default: 'Anonymous', maxlength: 64 },
    uploaderNote: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewNote: { type: String, default: '' },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserFileSchema.index({ status: 1, createdAt: -1 });

const UserFile: Model<IUserFile> =
  mongoose.models.UserFile ||
  mongoose.model<IUserFile>('UserFile', UserFileSchema, 'nova-browser_user_uploads');

export default UserFile;
