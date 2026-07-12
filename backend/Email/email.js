import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

const getSenderEmail = () => {
  const emailUser = process.env.EMAIL_USER?.trim();

  if (!emailUser) {
    throw new Error("EMAIL_USER must be set (used as the from address)");
  }

  return emailUser;
};

const getGmailCredentials = () => {
  const emailUser = getSenderEmail();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s/g, "");

  if (!emailPass) {
    throw new Error("EMAIL_PASS must be set when SENDGRID_API_KEY is not used");
  }

  return { emailUser, emailPass };
};

const useSendGrid = () => Boolean(process.env.SENDGRID_API_KEY?.trim());

export const isEmailConfigured = () =>
  useSendGrid() || Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());

export const getEmailProviderName = () => {
  if (useSendGrid()) return "SendGrid";
  if (process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim()) return "Gmail SMTP";
  return "none";
};

const sendWithSendGrid = async ({ email, subject, html }) => {
  const apiKey = process.env.SENDGRID_API_KEY.trim();
  const fromEmail = getSenderEmail();

  sgMail.setApiKey(apiKey);

  const [response] = await sgMail.send({
    to: email,
    from: {
      email: fromEmail,
      name: "CareerForge",
    },
    subject,
    html,
  });

  console.log("Message sent via SendGrid:", response.statusCode);
  return response;
};

const sendWithGmail = async ({ email, subject, html }) => {
  const { emailUser, emailPass } = getGmailCredentials();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 15000,
    socketTimeout: 15000,
  });

  const info = await transporter.sendMail({
    from: `"CareerForge" <${emailUser}>`,
    to: email,
    subject,
    html,
  });

  console.log("Message sent via Gmail:", info.messageId);
  return info;
};

export default async function sendEmail({ email, subject, html }) {
  try {
    if (useSendGrid()) {
      return await sendWithSendGrid({ email, subject, html });
    }

    return await sendWithGmail({ email, subject, html });
  } catch (error) {
    console.error("Email error:", error.message);
    throw error;
  }
}
