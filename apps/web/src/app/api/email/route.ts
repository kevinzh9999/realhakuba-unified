import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, msg } = await req.json();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
    },
    body: JSON.stringify({
      from: 'Real Hakuba <noreply@realhakuba.com>', // 需在 Resend 已验证域
      to: 'inquiry@realhakuba.com',
      subject: 'Website inquiry',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${msg.replace(/\n/g, '<br/>')}</p>
      `,
      reply_to: email,            // 让你直接点“回复”回到访客邮箱
    }),
  });

  if (!res.ok) {
    console.error(await res.text());
    return new Response('Mail failed', { status: 500 });
  }
  return new Response('OK');
}