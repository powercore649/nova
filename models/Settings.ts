import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  backgroundUrl: string;
  backgroundOpacity: number;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    backgroundUrl: { type: String, default: '' },
    backgroundOpacity: { type: Number, default: 0.15, min: 0, max: 1 },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', SettingsSchema, 'nova-browser_settings');

export default Settings;
