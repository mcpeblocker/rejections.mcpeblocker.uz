import nodemailer from "nodemailer";
import appConfig from "../config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: appConfig.GMAIL_EMAIL_ADDRESS,
        pass: appConfig.GMAIL_APP_PASSWORD,
    },
});

const createVerificationMagicLink = (baseUrl: string, token: string) => {
    return `${baseUrl}/verify-email?token=${token}`;
}

class EmailService {
    static async sendEmail(to: string, subject: string, content: string) {
        const mailOptions = {
            from: `"Rejections Tracker" <${appConfig.GMAIL_EMAIL_ADDRESS}>`,
            to,
            subject,
            html: content,
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error(`sendEmail: Error sending email to ${to}:`, error);
            return false;
        }
    };

    static async sendVerificationEmail(to: string, token: string) {
        const magicLink = createVerificationMagicLink(appConfig.BASE_URL, token);
        const subject = "🚀 Complete Your Journey to Resilience!";
        const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    <!-- Header Section -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                                🎯 Welcome to Your Journey!
                            </h1>
                            <p style="margin: 15px 0 0; color: #f0f4ff; font-size: 16px; opacity: 0.95;">
                                Turn every rejection into a stepping stone
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">
                                You're One Click Away! 🚀
                            </h2>
                            
                            <p style="margin: 0 0 25px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hi there! We're excited to have you join our community of resilient individuals who are transforming rejections into growth opportunities.
                            </p>

                            <!-- Stats Preview -->
                            <table role="presentation" style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 20px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; text-align: center; border: 2px solid #667eea20;">
                                        <div style="font-size: 32px; margin-bottom: 8px;">💪</div>
                                        <div style="color: #667eea; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Track Progress</div>
                                        <div style="color: #718096; font-size: 14px;">Log rejections & watch your resilience grow</div>
                                    </td>
                                </tr>
                                <tr><td style="height: 15px;"></td></tr>
                                <tr>
                                    <td style="padding: 20px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; text-align: center; border: 2px solid #667eea20;">
                                        <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                                        <div style="color: #667eea; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Level Up</div>
                                        <div style="color: #718096; font-size: 14px;">From Bronze to Legend status</div>
                                    </td>
                                </tr>
                                <tr><td style="height: 15px;"></td></tr>
                                <tr>
                                    <td style="padding: 20px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; text-align: center; border: 2px solid #667eea20;">
                                        <div style="font-size: 32px; margin-bottom: 8px;">🌟</div>
                                        <div style="color: #667eea; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Share Journey</div>
                                        <div style="color: #718096; font-size: 14px;">Inspire others with your story</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${magicLink}" style="display: inline-block; padding: 18px 45px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                                            ✨ Verify Email & Get Started
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 15px; color: #718096; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #4a5568;">Button not working?</strong> Copy and paste this link:
                            </p>
                            <div style="padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea; word-break: break-all;">
                                <a href="${magicLink}" style="color: #667eea; text-decoration: none; font-size: 13px;">${magicLink}</a>
                            </div>

                            <!-- Motivational Quote -->
                            <table role="presentation" style="width: 100%; margin: 35px 0 0;">
                                <tr>
                                    <td style="padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
                                        <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic; line-height: 1.6;">
                                            💡 <strong>"Every rejection is simply a redirection to something better."</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background: #f7fafc; border-top: 2px solid #e2e8f0;">
                            <p style="margin: 0 0 15px; color: #718096; font-size: 13px; line-height: 1.6;">
                                This verification link will expire in <strong style="color: #4a5568;">24 hours</strong>.
                            </p>
                            <p style="margin: 0 0 20px; color: #718096; font-size: 13px; line-height: 1.6;">
                                Didn't request this? You can safely ignore this email.
                            </p>
                            <div style="padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; font-weight: 600;">
                                    Need help? We're here for you!
                                </p>
                                <p style="margin: 0; color: #718096; font-size: 13px;">
                                    📧 <a href="mailto:mcpeblockeruzs@gmail.com" style="color: #667eea; text-decoration: none;">mcpeblockeruzs@gmail.com</a>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Brand Footer -->
                    <tr>
                        <td style="padding: 25px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                            <p style="margin: 0 0 10px; color: #ffffff; font-size: 16px; font-weight: 600;">
                                Rejections Tracker
                            </p>
                            <p style="margin: 0; color: #e0e7ff; font-size: 13px; opacity: 0.9;">
                                Building resilience, one rejection at a time 💪
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Bottom Spacing -->
                <table role="presentation" style="margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; color: #ffffff; font-size: 12px; opacity: 0.8;">
                                © 2025 Rejections Tracker. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return await this.sendEmail(to, subject, content);
    }
}

export default EmailService;