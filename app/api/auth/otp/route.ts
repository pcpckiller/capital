import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getEmailConfig, saveOTP } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const config = await getEmailConfig();
  if (!config.enabled) {
    // If email verification is disabled in admin, we don't send anything but return ok
    // This allows testing without real SMTP.
    return NextResponse.json({ message: 'Email verification is currently disabled by admin.' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await saveOTP(email, code);

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: `"${config.from}" <${config.user}>`,
      to: email,
      subject: 'Cartoon Capital - 注册验证码 / Verification Code',
      text: `您的验证码是: ${code}。有效期为 10 分钟。`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>欢迎注册 Cartoon Capital</h2>
          <p>您的注册验证码是：</p>
          <div style="font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0;">${code}</div>
          <p>该验证码有效期为 10 分钟。请勿泄露给他人。</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">这是系统自动发送的邮件，请勿回复。</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email. Please check your SMTP settings.' }, { status: 500 });
  }
}
