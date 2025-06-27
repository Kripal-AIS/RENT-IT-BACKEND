import { Router } from 'express';
import { login, register, resetPassword, resetTokenVerify, sendEmailVerification, sendOtp, sendResetEmail, unVerified, verifyEmail, verifyOtp } from '../Controllers/AuthController.js';
import VerifyToken from '../Helper/VerifyToken.js';

const router = Router();

router.get("/unverified/:id",unVerified.controller);


router.post("/register", register.validator, register.controller);
 
router.post("/login", login.validator, login.controller);

// Send Email verification Link.
router.get("/send_verification_email", VerifyToken, sendEmailVerification.controller);

// When Open email verification Link.
router.get("/verify_email", verifyEmail.controller);

// Send Password reset Link.
router.post("/send_reset_email", sendResetEmail.validator, sendResetEmail.controller);

// When Open reset Password Link.
router.get("/reset_password", resetTokenVerify.controller);

// When Enter New Passwords and Click submit.
router.put("/reset_password", resetPassword.validator, resetPassword.controller);



export default router;
