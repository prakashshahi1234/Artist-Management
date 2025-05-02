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

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    const html = `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"No Reply" <no-reply@example.com>', // Use MAIL_FROM from .env or default to "No Reply"
      to,
      subject: 'Verify Your Email',
      html,
    });
  }
}
