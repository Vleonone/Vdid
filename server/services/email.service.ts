/**
 * Email Service
 * 使用 Resend 发送邮件
 *
 * 功能：
 * - 邮箱验证
 * - 密码重置
 * - 登录通知
 * - 欢迎邮件
 */

import { Resend } from 'resend';
import { config, isProd } from '../config';

// 初始化 Resend 客户端
const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

// 邮件模板类型
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ============================================
// Email Templates
// ============================================

function verificationEmailTemplate(params: {
  displayName: string;
  verifyUrl: string;
  vid: string;
}): EmailTemplate {
  const { displayName, verifyUrl, vid } = params;

  return {
    subject: 'Verify your VDID email address',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 12px; padding: 40px; border: 1px solid #262626;">
    <h1 style="color: #f59e0b; margin: 0 0 20px;">VDID</h1>
    <h2 style="margin: 0 0 20px; font-size: 24px;">Verify your email</h2>
    <p style="color: #a1a1aa; line-height: 1.6;">Hi ${displayName || 'there'},</p>
    <p style="color: #a1a1aa; line-height: 1.6;">Please click the button below to verify your email address and activate your VDID account.</p>
    <div style="margin: 30px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background-color: #f59e0b; color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
    </div>
    <p style="color: #71717a; font-size: 14px;">Your V-ID: <code style="background: #262626; padding: 4px 8px; border-radius: 4px;">${vid}</code></p>
    <p style="color: #71717a; font-size: 14px;">This link expires in 24 hours.</p>
    <hr style="border: none; border-top: 1px solid #262626; margin: 30px 0;">
    <p style="color: #71717a; font-size: 12px;">If you didn't create a VDID account, you can safely ignore this email.</p>
  </div>
</body>
</html>
    `,
    text: `
VDID - Verify your email

Hi ${displayName || 'there'},

Please verify your email by visiting this link:
${verifyUrl}

Your V-ID: ${vid}

This link expires in 24 hours.

If you didn't create a VDID account, you can safely ignore this email.
    `,
  };
}

function passwordResetTemplate(params: {
  displayName: string;
  resetUrl: string;
}): EmailTemplate {
  const { displayName, resetUrl } = params;

  return {
    subject: 'Reset your VDID password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 12px; padding: 40px; border: 1px solid #262626;">
    <h1 style="color: #f59e0b; margin: 0 0 20px;">VDID</h1>
    <h2 style="margin: 0 0 20px; font-size: 24px;">Reset your password</h2>
    <p style="color: #a1a1aa; line-height: 1.6;">Hi ${displayName || 'there'},</p>
    <p style="color: #a1a1aa; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
    </div>
    <p style="color: #71717a; font-size: 14px;">This link expires in 1 hour.</p>
    <hr style="border: none; border-top: 1px solid #262626; margin: 30px 0;">
    <p style="color: #71717a; font-size: 12px;">If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
  </div>
</body>
</html>
    `,
    text: `
VDID - Reset your password

Hi ${displayName || 'there'},

We received a request to reset your password. Visit this link to create a new password:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email.
    `,
  };
}

function welcomeEmailTemplate(params: {
  displayName: string;
  vid: string;
  dashboardUrl: string;
}): EmailTemplate {
  const { displayName, vid, dashboardUrl } = params;

  return {
    subject: 'Welcome to VDID - Your Decentralized Identity',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VDID</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 12px; padding: 40px; border: 1px solid #262626;">
    <h1 style="color: #f59e0b; margin: 0 0 20px;">VDID</h1>
    <h2 style="margin: 0 0 20px; font-size: 24px;">Welcome to VDID!</h2>
    <p style="color: #a1a1aa; line-height: 1.6;">Hi ${displayName || 'there'},</p>
    <p style="color: #a1a1aa; line-height: 1.6;">Your decentralized identity has been created. You now have a unique V-ID that represents you across the Velon ecosystem.</p>
    <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #71717a; margin: 0 0 8px; font-size: 14px;">Your V-ID</p>
      <p style="color: #f59e0b; margin: 0; font-size: 20px; font-family: monospace;">${vid}</p>
    </div>
    <h3 style="margin: 30px 0 15px; font-size: 18px;">Get Started</h3>
    <ul style="color: #a1a1aa; line-height: 2; padding-left: 20px;">
      <li>Complete your profile to earn V-Score points</li>
      <li>Connect your Web3 wallets</li>
      <li>Enable 2FA for extra security</li>
      <li>Explore the Velon ecosystem</li>
    </ul>
    <div style="margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #f59e0b; color: #000000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
    `,
    text: `
VDID - Welcome to VDID!

Hi ${displayName || 'there'},

Your decentralized identity has been created. You now have a unique V-ID that represents you across the Velon ecosystem.

Your V-ID: ${vid}

Get Started:
- Complete your profile to earn V-Score points
- Connect your Web3 wallets
- Enable 2FA for extra security
- Explore the Velon ecosystem

Visit your dashboard: ${dashboardUrl}
    `,
  };
}

// ============================================
// Email Service Class
// ============================================

class EmailService {
  private from: string;
  private clientUrl: string;

  constructor() {
    this.from = config.EMAIL_FROM;
    this.clientUrl = config.CLIENT_URL;
  }

  /**
   * 检查邮件服务是否可用
   */
  isAvailable(): boolean {
    return resend !== null;
  }

  /**
   * 发送邮件
   */
  private async send(to: string, template: EmailTemplate): Promise<boolean> {
    // 如果没有配置 Resend，在开发环境打印到控制台
    if (!resend) {
      if (!isProd) {
        console.log('\n📧 [DEV] Email would be sent:');
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${template.subject}`);
        console.log(`   Text: ${template.text.substring(0, 200)}...`);
        console.log('');
      } else {
        console.error('Email service not configured (RESEND_API_KEY missing)');
      }
      return !isProd; // 开发环境返回 true，生产环境返回 false
    }

    try {
      const { error } = await resend.emails.send({
        from: this.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error('Failed to send email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * 发送邮箱验证邮件
   */
  async sendVerificationEmail(params: {
    to: string;
    displayName: string;
    verifyToken: string;
    vid: string;
  }): Promise<boolean> {
    const verifyUrl = `${this.clientUrl}/verify-email?token=${params.verifyToken}`;
    const template = verificationEmailTemplate({
      displayName: params.displayName,
      verifyUrl,
      vid: params.vid,
    });
    return this.send(params.to, template);
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(params: {
    to: string;
    displayName: string;
    resetToken: string;
  }): Promise<boolean> {
    const resetUrl = `${this.clientUrl}/reset-password?token=${params.resetToken}`;
    const template = passwordResetTemplate({
      displayName: params.displayName,
      resetUrl,
    });
    return this.send(params.to, template);
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(params: {
    to: string;
    displayName: string;
    vid: string;
  }): Promise<boolean> {
    const dashboardUrl = `${this.clientUrl}/dashboard`;
    const template = welcomeEmailTemplate({
      displayName: params.displayName,
      vid: params.vid,
      dashboardUrl,
    });
    return this.send(params.to, template);
  }
}

// 导出单例
export const emailService = new EmailService();
