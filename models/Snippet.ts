import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISnippet extends Document {
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    downloadUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SnippetSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, required: true },
        language: { type: String, default: 'javascript' },
        tags: { type: [String], default: [] },
        downloadUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

// Check if model already exists to prevent overwrite error in hot reload
<<<<<<< HEAD
const Snippet: Model<ISnippet> = mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema, 'codex_snippets');
=======
const Snippet: Model<ISnippet> = mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema, 'nova-browser_snippets');
>>>>>>> 29aed2e9981bab3783c1bfffea7c7f06ccce60ec

export default Snippet;
