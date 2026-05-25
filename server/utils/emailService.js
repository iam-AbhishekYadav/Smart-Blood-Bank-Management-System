import nodemailer from "nodemailer";

const createTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

export const sendOtpEmail = async (email, otp) => {
  if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
    return;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Smart Blood Bank Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });
};
