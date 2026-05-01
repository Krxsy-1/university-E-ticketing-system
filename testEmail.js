import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email",
      text: "If you see this, your setup works 🎉",
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

sendTestEmail();