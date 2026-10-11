import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your Registration OTP",
    text: `Your verification OTP is ${otp}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
  });
}