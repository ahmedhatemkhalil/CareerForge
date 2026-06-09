import nodemailer from "nodemailer";

export default async function sendEmail({ email, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amanymahmoudemam2003@gmail.com",
        pass: "jmsw dipm ggqt nplp",
      },
    });

    const info = await transporter.sendMail({
      from: '"CareerForge" <amanymahmoudemam2003@gmail.com>',
      to: email,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);

  } catch (error) {
    console.log("Email error:", error.message);
  }
}