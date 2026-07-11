// src/pages/api/sticky-note.ts
// Astro API endpoint — receives sticky note submissions and emails you via Resend
//
// Setup:
// 1. Sign up at resend.com and get an API key
// 2. Replace YOUR_RESEND_API_KEY with your key
// 3. Replace YOUR_EMAIL@EXAMPLE.COM with your email address
// 4. Replace YOUR_VERIFIED_DOMAIN.COM with your verified Resend domain
//    (or use onboarding@resend.dev as sender for testing)

import type { APIRoute } from 'astro';
 
export const prerender = false;

const RESEND_API_KEY = 're_gDX3bKAG_AiucqttiABcfH2ATs9kgGZzH';
const TO_EMAIL       = 'windandverse@gmail.com';
const FROM_EMAIL     = 'onboarding@resend.dev';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { note, poemTitle, poemUrl } = await request.json();

        if (!note || note.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Empty note' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject: `New sticky note on "${poemTitle}"`,
                html: `
                    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #faf8f5; border-radius: 12px;">
                        <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7e6e; margin: 0 0 8px;">Wind & Verse — Sticky Note</p>
                        <h2 style="font-size: 1.4rem; font-weight: 400; color: #1a1816; margin: 0 0 24px; border-bottom: 1px solid rgba(26,24,20,0.1); padding-bottom: 16px;">${poemTitle}</h2>
                        <blockquote style="background: #fef9c3; border-left: 3px solid #fbbf24; margin: 0 0 24px; padding: 16px 20px; border-radius: 4px; font-style: italic; color: #1a1814; line-height: 1.7;">
                            ${note}
                        </blockquote>
                        <a href="${poemUrl}" style="font-size: 0.8rem; color: #4a6fa5;">View poem →</a>
                    </div>
                `,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('Resend error:', err);
            return new Response(JSON.stringify({ error: 'Failed to send' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('API error:', err);
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};