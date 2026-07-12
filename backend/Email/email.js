import nodemailer from "nodemailer";

export default async function sendEmail({ email, subject, html }) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

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
