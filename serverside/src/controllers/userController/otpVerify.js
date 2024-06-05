const ForgetPassword = require('../../models/coreModels/forgetPassword');

module.exports = {
    otpVerify: async (req, res) => {
        const { otp,email } = req.body;
        console.log(req.body)
        try {
            if (!otp || !email) {
                return res.status(400).json({ message: "All fields is required" });
              }
    
            const user = await ForgetPassword.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'Otp not found' });
            }

            if (parseInt(user.otp) === parseInt(otp))
                {
                res.status(200).json({
                    message: "Otp Verify successfully",
                })}
            else {
                console.error('Error:', "Otp is incorrect");
                }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};