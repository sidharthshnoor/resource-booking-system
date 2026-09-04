import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

export async function verifySMTPConnection() {
  if (!transporter) {
    console.log('SMTP configured: no');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('SMTP configured: yes');
    console.log('SMTP connection: verified');
    console.log(`SMTP sender: ${env.smtp.from}`);
    return true;
  } catch (error) {
    console.log('SMTP configured: yes');
    console.log('SMTP connection: failed');
    console.error('SMTP Error:', error.message);
    return false;
  }
}

export async function sendEmail({ to, subject, text }) {
  if (!transporter) {
    console.error('SMTP Configuration Error: Missing SMTP settings in environment variables.');
    throw new Error('Email service is not properly configured.');
  }

  try {
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
    });
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Failed to send email.');
  }
}

export async function sendInvitationEmail(email, token) {
  const inviteLink = `${env.frontendUrl}/create-account?token=${token}`;
  
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
