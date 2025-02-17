const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS,
  },
});

module.exports = async function sendEmail(mailOptions) {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}