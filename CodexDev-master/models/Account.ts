import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
    username: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

const AccountSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        passwordHash: { type: String, required: true },
    },
    { timestamps: true }
);

const Account: Model<IAccount> =
    mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema, 'nova-browser_accounts');

export default Account;
