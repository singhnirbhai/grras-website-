import nodemailer from "nodemailer";

export async function sendMail(to: string, from: string, subject: string, html: string) {
  try {
    const user = process.env.mail || process.env.MAIL || "";
    const pass = process.env.pass || process.env.PASS || "";

    if (!user || !pass) {
      console.warn("Mail credentials not configured. Skipping email send.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      to,
      from: from || user,
      subject,
      html,
    });
    if (info) {
      console.log("Email Sent Successfully to:", to);
    }
  } catch (error) {
    console.error("Error while Sending Mail:", error);
  }
}
