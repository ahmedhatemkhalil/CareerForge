import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export default async function sendEmail({ email, subject, html }) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"CareerForge" <${EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);

  } catch (error) {
    console.log("Email error:", error.message);
  }
}