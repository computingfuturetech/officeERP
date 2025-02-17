const ForgetPassword = require("../../models/coreModels/forgetPassword");
const Admin = require("../../models/coreModels/Admin");
const generateRandomNumber = require("../../utils/generateRandomNumber");
const sendEmail = require("../../utils/sendEmail");

module.exports = {
  forgetPassword: async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await Admin.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = generateRandomNumber(100000, 999999);

      const expirationTime = Date.now() + 300000;

      const previousOtpFound = await ForgetPassword.find({ email: email });

      if (previousOtpFound.length > 0) {
        await ForgetPassword.deleteMany({ email: email });
      }

      const forgetPassword = new ForgetPassword({
        email: email,
        otp: token,
      });

      await forgetPassword.save();

      const mailOptions = {
        from: "anasircft@gmail.com",
        to: "artahir@computingfuturetech.com",
        subject: "Password Reset Request",
        text:
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please use the following 6-digit code to reset your password: ${token}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      try {
        await sendEmail(mailOptions);
        res.status(200).json({
          message: "Forget Password email sent successfully",
        });
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
          message: "Failed to send email",
        });
      }
    } catch (error) {
      console.log("heeelkjoijoi");
      console.error("Error in forgetPassword:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
