const ForgetPassword = require("../../models/coreModels/forgetPassword");

module.exports = {
  otpVerify: async (req, res) => {
    const { otp, email } = req.body;
    try {
      if (!otp || !email) {
        return res
          .status(400)
          .json({ message: "Both otp and email are required" });
      }

      const forgetPasswordRecord = await ForgetPassword.findOne({ email });
      if (!forgetPasswordRecord) {
        return res.status(404).json({ error: "Otp not found" });
      }

      if (forgetPasswordRecord.otp === Number(otp)) {
        res.status(200).json({
          message: "Otp Verify successfully",
        });
      } else {
        res.status(400).json({
          message: "Otp is incorrect",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
