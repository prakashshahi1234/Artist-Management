import nodemailer from 'nodemailer';

export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: Number(process.env.MAIL_PORT) || 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate required parameters
      if (!to || !verificationUrl) {
        throw new Error('Missing required parameters: to or verificationUrl');
      }

      // Improved HTML template
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #2563eb;">Email Verification</h2>
          <p style="font-size: 16px;">Thank you for registering! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:<br>${verificationUrl}</p>
        </div>
      `;

      const mailOptions = {
        from: process.env.MAIL_FROM || '"No Reply" <no-reply@example.com>',
        to,
        subject: 'Verify Your Email',
        html,
      };

      // Test the connection first
      await this.transporter.verify();

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, message: 'Verification email sent successfully' };

    } catch (error) {
      console.error('Error sending verification email:', error);
      
      let errorMessage = 'Failed to send verification email';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  }
}