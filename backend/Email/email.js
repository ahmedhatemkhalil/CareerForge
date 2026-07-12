import nodemailer from "nodemailer";

export default async function sendEmail({ email, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ahmedhatemkhalil@gmail.com",
        pass: "ocby novi sybv djmu",
      },
    });

    const info = await transporter.sendMail({
      from: '"CareerForge" <ahmedhatemkhalil@gmail.com>',
      to: email,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);

  } catch (error) {
    console.log("Email error:", error.message);
  }
}