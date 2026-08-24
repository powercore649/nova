import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export const dynamic = 'force-dynamic';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Very small in-memory rate limit per server instance: 1 ticket per 30s per IP.
// Not persistent across cold starts / multiple instances, but cheap first line of defense.
const lastSubmission = new Map<string, number>();
const RATE_LIMIT_MS = 30_000;

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendToDiscord(ticket: { _id: unknown; name: string; email: string; subject: string; message: string; createdAt: Date }) {
    if (!DISCORD_WEBHOOK_URL) {
        console.warn('DISCORD_WEBHOOK_URL is not set — skipping Discord notification.');
        return;
    }

    const payload = {
        embeds: [
            {
                title: `🎫 New Support Ticket`,
                color: 0x22c55e, // matches the site's green theme
                fields: [
                    { name: 'Subject', value: ticket.subject.slice(0, 256) || '(none)', inline: false },
                    { name: 'From', value: `${ticket.name} (${ticket.email})`, inline: false },
                    { name: 'Message', value: ticket.message.slice(0, 1000) || '(empty)', inline: false },
                    { name: 'Ticket ID', value: String(ticket._id), inline: false },
                ],
                timestamp: new Date(ticket.createdAt).toISOString(),
            },
        ],
    };

    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            console.error('Discord webhook responded with', res.status, await res.text());
        }
    } catch (err) {
        console.error('Failed to send ticket to Discord webhook:', err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const last = lastSubmission.get(ip);
        if (last && Date.now() - last < RATE_LIMIT_MS) {
            return NextResponse.json(
                { error: 'Please wait a moment before submitting another ticket.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const name = (body.name || '').toString().trim();
        const email = (body.email || '').toString().trim();
        const subject = (body.subject || '').toString().trim();
        const message = (body.message || '').toString().trim();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
        }
        if (message.length > 4000) {
            return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
        }

        await dbConnect();
        const ticket = await Ticket.create({ name, email, subject, message });

        lastSubmission.set(ip, Date.now());

        // Fire and forget — don't block the response on Discord's latency,
        // but still await so serverless functions don't get killed before it sends.
        await sendToDiscord(ticket);

        return NextResponse.json({ success: true, ticketId: ticket._id }, { status: 201 });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
    }
}
