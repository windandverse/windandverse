// src/pages/api/like-notification.ts
// Receives like events and emails you via Resend
//
// Replace the three placeholders before deploying:
// YOUR_RESEND_API_KEY, YOUR_EMAIL@EXAMPLE.COM, likes@YOUR_VERIFIED_DOMAIN.COM

import type { APIRoute } from 'astro';
 
export const prerender = false;

const RESEND_API_KEY = 're_gDX3bKAG_AiucqttiABcfH2ATs9kgGZzH'; 
const TO_EMAIL       = 'windandverse@gmail.com';
const FROM_EMAIL     = 'onboarding@resend.dev';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { contentTitle, contentType, contentUrl } = await request.json();

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject: `Someone liked your ${contentType} — "${contentTitle}"`,
                html: `
                    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #faf8f5; border-radius: 12px;">
                        <p style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7e6e; margin: 0 0 8px;">Wind & Verse — New Like</p>
                        <h2 style="font-size: 1.4rem; font-weight: 400; color: #1a1816; margin: 0 0 16px; border-bottom: 1px solid rgba(26,24,20,0.1); padding-bottom: 16px;">
                            ♥ Someone liked your ${contentType}
                        </h2>
                        <p style="color: #3a3530; font-size: 1rem; margin: 0 0 24px; font-style: italic;">"${contentTitle}"</p>
                        <a href="${contentUrl}" style="display: inline-block; background: #1a1816; color: #e0d5c0; padding: 10px 24px; border-radius: 40px; text-decoration: none; font-size: 0.8rem; letter-spacing: 0.05em;">View ${contentType} →</a>
                    </div>
                `,
            }),
        });

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
};