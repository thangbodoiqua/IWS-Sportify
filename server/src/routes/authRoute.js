import express from 'express';
import { register, login, logout, isAuthenticated, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword } from '../controllers/authController.js';
import { userAuth } from '../middleware/authMiddleWare.js';

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', userAuth, logout);
authRoute.get('/is-auth', isAuthenticated)
authRoute.post('/send-verify-otp', userAuth, sendVerifyOtp );
authRoute.post('/verify-account', userAuth, verifyEmail );
authRoute.post('/send-reset-otp', sendResetOtp);
authRoute.post('/reset-password', resetPassword); 
export default authRoute;