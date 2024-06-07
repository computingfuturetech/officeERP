const ForgetPassword = require('../../models/coreModels/forgetPassword');
const UserModel = require('../../models/coreModels/Admin');
const nodemailer = require('nodemailer');


module.exports = {
    forgetPassword: async (req, res) => {
        const { email } = req.body;
        function generateRandomNumber() {
            return Math.floor(100000 + Math.random() * 900000);
        }

        try {
            if (!email) {
                return res.status(400).json({ message: "Email field is required" });
              }
    
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const token = generateRandomNumber();

            const expirationTime = Date.now() + 300000; 

            const previousOtpFound = await ForgetPassword.find({email:email})


            if (previousOtpFound.length > 0) {
                await ForgetPassword.deleteMany({ email: email });
                console.log("Previous OTP deleted successfully");
                }

            const forgetPassword = await new ForgetPassword({
                email: email,
                otp: token,
            });

            await forgetPassword.save().then (()=>{console.log("saved")})

            const transporter = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.PASS,
                }
            });

            const mailOptions = {
                from: 'anasircft@gmail.com',
                to: email,
                subject: 'Password Reset Request',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n`
                    + `Please use the following 6-digit code to reset your password: ${token}\n\n`
                    + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error:', error);
                } else {
                    res.status(200).json({
                        message: "Email Sent successfully",
                      })
                }
            });
        } catch (error) {
            console.error('Error in forgetPassword:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};