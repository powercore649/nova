import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'new_project' | 'new_comment' | 'new_file';

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  targetId: string;       // snippet _id or file _id
  targetType: 'project' | 'file';
  targetName: string;     // project title or file name
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    type: { type: String, enum: ['new_project', 'new_comment', 'new_file'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ['project', 'file'], required: true },
    targetName: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema, 'nova-browser_notifications');

export default Notification;
