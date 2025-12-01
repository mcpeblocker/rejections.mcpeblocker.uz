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
            from: appConfig.GMAIL_EMAIL_ADDRESS,
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
        const subject = "Verify your email for rejections.mcpeblocker.uz";
        const content = `
    <p>Click the button below to verify your email address:</p>
    <a href="${magicLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Button not working? Copy and paste the following link into your browser:</p>
    <p><a href="${magicLink}">${magicLink}</a></p>
    <p>If you did not request this, please ignore this email.</p>
    `;

        return await this.sendEmail(to, subject, content);
    }
}

export default EmailService;