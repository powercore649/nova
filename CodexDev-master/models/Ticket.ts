import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'open' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
    },
    { timestamps: true }
);

const Ticket: Model<ITicket> =
    mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema, 'nova-browser_tickets');

export default Ticket;
