import { env } from '../config/env.js';

export function verifyEmailConfiguration() {
  const configured = Boolean(env.email.apiKey);
  console.log(`HTTPS email configured: ${configured ? 'yes' : 'no'}`);
}

export async function sendEmail({ to, subject, text }) {
  if (!env.email.apiKey) {
    console.error('HTTPS email configuration error: email provider is not configured.');
    throw new Error('Email service is not properly configured.');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.email.from,
        to: [to],
        subject,
        text
      })
    });

    if (!response.ok) {
      throw new Error(`Email provider returned HTTP ${response.status}.`);
    }

    return true;
  } catch (error) {
    console.error('HTTPS email delivery failed:', error.message);
    throw new Error('Failed to send email.');
  }
}

export async function sendInvitationEmail(email, token, organizationSlug) {
  const inviteLink = `${env.frontendUrl}/org/${encodeURIComponent(organizationSlug)}/create-account?token=${token}`;
  
  const text = `Hello,

You have been invited to create an account for the Resource Booking System.

Please navigate to the following link to create your account:
${inviteLink}

This invitation link is temporary and can only be used once. It will expire in 24 hours.

If you did not expect this invitation, you can ignore this email.`;

  return sendEmail({
    to: email,
    subject: "You're invited to create your RBS account",
    text
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${env.frontendUrl}/reset-password?token=${token}`;
  
  const text = `Hello,

We received a request to reset your Resource Booking System password.

Please navigate to the following link to create a new password:
${resetLink}

This link expires in exactly 2 minutes and can only be used once.

If you did not request this password reset, you can safely ignore this email.`;

  return sendEmail({
    to: email,
    subject: "Reset your RBS password",
    text
  });
}
