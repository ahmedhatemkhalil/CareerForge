import nodemailer from "nodemailer";

const getEmailCredentials = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim().replace(/\s/g, "");

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
  }

  return { emailUser, emailPass };
};

export const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());

export default async function sendEmail({ email, subject, html }) {
  const { emailUser, emailPass } = getEmailCredentials();

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

  try {
    const info = await transporter.sendMail({
      from: `"CareerForge" <${emailUser}>`,
      to: email,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error.message);
    throw error;
  }
}
