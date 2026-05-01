const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function test() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Nodemailer Upgrade Test",
      text: "If you see this, upgrade worked fine 🎉",
    });

    console.log("SUCCESS:", info.response);
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();