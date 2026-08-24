import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFile extends Document {
    filename: string;
    originalName: string;
    fileUrl: string;
    fileType: 'image' | 'zip';
    mimeType: string;
    fileSize: number;
    thumbnailUrl?: string;
    youtubeUrl?: string;
    uploadedBy: string;
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema: Schema = new Schema(
    {
        filename: { type: String, required: true, unique: true },
        originalName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, enum: ['image', 'zip'], required: true },
        mimeType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        thumbnailUrl: { type: String, default: '' },
        youtubeUrl: { type: String, default: '' },
        uploadedBy: { type: String, default: 'admin' },
        downloads: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Check if model already exists to prevent overwrite error in hot reload
<<<<<<< HEAD
const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema, 'nova-browser_files');
=======
<<<<<<< HEAD
const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema, 'codex_files');
=======
const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema, 'nova-browser_files');
>>>>>>> 29aed2e9981bab3783c1bfffea7c7f06ccce60ec
>>>>>>> 1bdfeb0db1a2d0f29da465beeb1cdd78b76f54ae

export default File;
