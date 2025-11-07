import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
// Initialize Resend with error handling
let resend;
try {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
  }
  resend = new Resend(process.env.RESEND_API_KEY);
} catch (error) {
  console.error('Resend initialization error:', error.message);
  // Continue without Resend in development
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}
export const sendVerificationEmail = async (email, name, token) => {
  // In development without Resend API key, log to console instead
  if (!resend) {
    console.log(`
    ===============================
    DEVELOPMENT EMAIL VERIFICATION
    ===============================
    To: ${email}
    Subject: Verify Your Email - CareSync
    Name: ${name}
    Verification Code: ${token}
    ===============================
    `);
    return { id: 'dev-mode', message: 'Email logged to console' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CareSync <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Email - CareSync',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #333; background: white; padding: 20px; border-radius: 8px; border: 2px dashed #667eea; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CareSync!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with CareSync. Please use the verification code below to verify your email address:</p>
              <div class="code">${token}</div>
              <div class="warning">
                <strong>Note:</strong> This code will expire in 1 hour.
              </div>
              <p>If you didn't create an account with CareSync, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CareSync. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      // Fallback to console log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
        ===============================
        EMAIL SENDING FAILED - FALLBACK
        ===============================
        To: ${email}
        Verification Code: ${token}
        ===============================
        `);
      }
      throw error;
    }

    console.log('Verification email sent successfully to:', email);
    return data;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    
    // In development, always log to console as fallback
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
      ===============================
      EMAIL FALLBACK - VERIFICATION CODE
      ===============================
      To: ${email}
      Name: ${name}
      Verification Code: ${token}
      ===============================
      `);
    }
    
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  // In development without Resend API key, log to console instead
  if (!resend) {
    console.log(`
    ===============================
    DEVELOPMENT PASSWORD RESET
    ===============================
    To: ${email}
    Subject: Reset Your Password - CareSync
    Name: ${name}
    Reset URL: ${resetUrl}
    ===============================
    `);
    return { id: 'dev-mode', message: 'Reset email logged to console' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CareSync <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password - CareSync',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your CareSync account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour.
              </div>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CareSync. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      // Fallback to console log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`
        ===============================
        RESET EMAIL FALLBACK
        ===============================
        To: ${email}
        Reset URL: ${resetUrl}
        ===============================
        `);
      }
      throw error;
    }

    console.log('Password reset email sent successfully to:', email);
    return data;
  } catch (error) {
    console.error('Failed to send reset email:', error);
    
    // In development, always log to console as fallback
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
      ===============================
      RESET EMAIL FALLBACK
      ===============================
      To: ${email}
      Reset URL: ${resetUrl}
      ===============================
      `);
    }
    
    throw error;
  }
};