import User from "../Models/User.js";
import JWT from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import CryptoJS from "crypto-js";

dotenv.config();

const sendMail = async (mailContent, mailSubject, user) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'krso002ais.ac.nz@gmail.com',
            pass: process.env.EMAILPASSWORD
        }
    });

    var mailOptions = {
        from: 'krso002ais.ac.nz@gmail.com',
        to: user.email,
        subject: mailSubject,
        text: mailContent
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(error)
            return false;
        } else {
            // console.log(info);
            return true;
        }
    })
}

export const sendEmailVerification = {
    controller: async (req, res, next) => {
        try {
            const accessToken = JWT.sign(
                {
                    id: req.currUser._id,
                },
                process.env.JWT_SEC_KEY,
                { expiresIn: "1d" }
            );

            const mailContent = `Hi ${req.currUser.username}, \nclick the below URL to verify your email address. \nhttp://localhost:3000/emailverificationpage/${accessToken} \nIf you will not start the verification process now, than this link will expire in 24 hours.`;

            console.log("Email Verification");

            const mailSubject = 'Rent-It Email verification';

            const emailSentRes = await sendMail(mailContent, mailSubject, req.currUser);
            // if (emailSentRes) {
            return res.status(200).send("Verification email has been sent");
            // }
            // else {
            //     console.log("Error")
            //     return res.status(500).send("Internal Server Error");
            // }

        } catch (e) {
            console.log(e);
            return res.status(500).send("Internal Server Error");
        }
    }
}


//For trial
export const unVerified = {
    controller: async (req, res) => {
        const id = req.params.id;

        try {

            await User.findByIdAndUpdate(id, {
                emailverified: false,
                mobileverified: false
            });
            return res.status(200).send("unverified")

        }
        catch (e) {
            return res.status(400).send("Not unverified")
        }


    }
}

export const register = {
    validator: async (req, res, next) => {
        if (!req.body.username || !req.body.email || !req.body.mobile || !req.body.location || !req.body.password || !req.body.cpassword) {
            return res.status(400).send("Please Fill all the Fields");
        }
        if (req.body.username.indexOf(' ') >= 0) {
            return res.status(400).send("Username should not contain any space");
        }
        if (req.body.username.length < 3) {
            return res.status(400).send("Username must be greater than 3 characters");
        }
        if (req.body.password.length < 8) {
            return res.status(400).send("Password must be atleast 8 characters");
        }
        if (req.body.password !== req.body.cpassword) {
            return res.status(400).send("Password and Confirm Password Field Must be Same");
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const encryptedPassword = CryptoJS.AES.encrypt(req.body.password, process.env.JWT_SEC_KEY).toString();
console.log(encryptedPassword);
            const newUser = await User.create({
                username: req.body.username,
                email: req.body.email,
                mobile: req.body.mobile,
                location: req.body.location,
                password: encryptedPassword
            });
            const { password, ...other } = newUser._doc;
            return res.status(200).send({
                message: "Account Creation Successful",
                ...other
            });
        } catch (e) {
            console.log(e);
            if (e.keyValue?.username) return res.status(409).send("Username Already Exists");
            if (e.keyValue?.email) return res.status(409).send("Email Address Already Exists");
            if (e.keyValue?.mobile) return res.status(409).send("Mobile Number Already Exists");
            return res.status(500).send("Registration Failed");
        }
    }
};

export const login = {
    validator: async (req, res, next) => {
        if (!req.body.username || !req.body.password) {
            return res.status(400).send("Please Fill all the Fields");
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const findUser = await User.findOne({ username: req.body.username });
            if (!findUser) return res.status(401).send("Invalid Credentials");

            const decryptedPass = CryptoJS.AES.decrypt(findUser.password, process.env.JWT_SEC_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedPass !== req.body.password) return res.status(401).send("Invalid Credentials");

            const accessToken = JWT.sign({ id: findUser._id }, process.env.JWT_SEC_KEY, { expiresIn: "3d" });
            res.cookie('rentit', accessToken, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });

            const { password, ...others } = findUser._doc;
            return res.status(201).json({ success: true, ...others, accessToken });
        } catch (e) {
            return res.status(500).send("Login Failed Internal Server Error");
        }
    }
};

export const verifyEmail = {
    controller: async (req, res) => {
        if (!req.query.verify_email_token) {
            return res.status(400).send("Invalid Account Verification URL");
        }

        try {
            const verified = JWT.verify(req.query.verify_email_token, process.env.JWT_SEC_KEY);
            const findUser = await User.findOne({
                _id: verified.id
            });

            if (!findUser) {
                return res.status(400).send("User Not Found For Email verification")
            }

            await User.findByIdAndUpdate(findUser._id, {
                emailverified: true
            })

            res.status(201).send("Email Verification successful");

        } catch (e) {
            // console.log(e)
            return res.status(400).send("Account Verification Failed");
        }
    }
}

export const sendResetEmail = {
    validator: async (req, res, next) => {
        if (!req.body.email) {
            return res.status(400).send("Please Enter a Email Address");
        }
        next();
    },
    controller: async (req, res, next) => {
        try {
            const findUser = await User.findOne({ email: req.body.email });

            if (!findUser) {
                return res.status(404).send("User not found associated to this email id");
            }

            const accessToken = JWT.sign(
                {
                    id: findUser._id,
                },
                process.env.JWT_SEC_KEY,
                { expiresIn: 60 * 5 }
            );

            const mailContent = `Hi ${findUser.username}, \nAs You have Requested for reset password instructions, here they are, please click the URL or Copy the URL and Paste in your Browser \nhttp://localhost:3000/changepassword/${accessToken}`

            const mailSubject = 'Rent-It Password Reset';

            if (sendMail(mailContent, mailSubject, findUser))
                return res.status(200).send("Password reset email has been sent");
            else
                return res.status(500).send("Internal Server Error Mail");

        } catch (e) {
            res.status(500).send("Internal Server Error");
        }
    }
}

export const resetTokenVerify = {
    controller: async (req, res) => {
        if (!req.query.reset_password_token) {
            return res.status(400).send("Invalid Password Reset URL");
        }

        try {
            const verified = JWT.verify(req.query.reset_password_token, process.env.JWT_SEC_KEY);

            const findUser = await User.findOne({
                _id: verified.id
            });

            if (!findUser) {
                return res.status(400).send("User Not Found For Password Reset")
            }

            return res.status(201).json({
                token: req.query.reset_password_token
            });

        } catch (e) {
            return res.status(400).send("Invalid Password Reset URL");
        }
    }
}

export const resetPassword = {
    validator: async (req, res, next) => {
        if (!req.body.resetPassword || !req.body.retypePassword) {
            return res.status(400).send("Please Fill all the Fields");
        }
        if (req.body.resetPassword !== req.body.retypePassword) {
            return res.status(400).send("Both field value must be same");
        }
        next();
    },
    controller: async (req, res) => {
        try {
            const verified = JWT.verify(req.body.token, process.env.JWT_SEC_KEY);
            const findUser = await User.findOne({ _id: verified.id });
            if (!findUser) return res.status(401).send("User not found for password reset");

            const encryptedPassword = CryptoJS.AES.encrypt(req.body.resetPassword, process.env.JWT_SEC_KEY).toString();

            await User.findByIdAndUpdate(verified.id, { password: encryptedPassword }, { new: true });

            return res.status(200).send("Password Reset Successful");
        } catch (e) {
            return res.status(500).send("Password Reset Failed");
        }
    }
};

export const sendOtp = {
    validator: async (req, res, next) => {
        if (!req.body.mobile) {
            return res.status(400).send("Please Enter a Mobile Number");
        }
        next();
    },
    controller: async (req, res, next) => {
        try {
            const findUser = await User.findOne({ mobile: req.body.mobile });

            if (!findUser) {
                return res.status(404).send("User not found associated to this Mobile Number");
            }

            const ttl = 1000 * 60 * 2;
            const expireTime = Date.now() + ttl;
            const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });


            const hashToken = JWT.sign(
                {
                    mobile: req.body.mobile,
                    otp: otp,
                    expireTime: expireTime,
                    id: findUser._id
                },
                process.env.JWT_SEC_KEY,
                { expiresIn: 1000 * 60 * 2 }
            );



            res.status(201).json({
                token: hashToken,
            })

        } catch (e) {
            // console.log(e);
            res.status(500).send("Internal Server Error", e);
        }
    }
}

export const verifyOtp = {
    validator: async (req, res, next) => {
        if (!req.body.otp) {
            return res.status(400).send("Please Enter a OTP");
        }
        next();
    },
    controller: async (req, res, next) => {
        try {
            if (!req.body.token) {
                return res.status(400).send("OTP is invalid");
            }

            const verifiedToken = JWT.verify(req.body.token, process.env.JWT_SEC_KEY);

            const { mobile, otp, expireTime, id } = verifiedToken;

            if (expireTime < Date.now()) {
                return res.status(400).send("OTP is expired");
            }

            if (otp !== req.body.otp) {
                return res.status(400).send("OTP is Incorrect");
            }

            await User.findByIdAndUpdate(id, {
                mobileverified: true
            })

            return res.status(201).send("OTP verification Successful");

        } catch (e) {
            // console.log(e);
            res.status(500).send("Internal Server Error");
        }
    }
}