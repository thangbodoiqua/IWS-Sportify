import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const isExistedUser = await userModel.findOne({ email });

        if (isExistedUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const isSaved = await user.save();
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // });
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Our Service",
            text: `Hi ${name},\n\nThank you for registering! We're glad to have you on board.\n\nBest regards,\nThe Team`,
        };

        const isSend = await transporter.sendMail(mailOptions);
        
        return res.json({ success: true, message: "Register successful" });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Register error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email invalid" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Login error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({ message: "Logout error" });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {

        const { userId } = req; // Sử dụng userId từ middleware
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}. Verify your account using this OTP.`,
        };

        await transporter.sendMail(mailOption);
        res.json({ success: true, message: `Verification OTP sent on your email` });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { userId } = req; // Sử dụng userId từ middleware
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: `User not found` });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const isAuthenticated = async (req, res) => {   
    const { token } = req.cookies;
    
        if (!token) {
            return res.status(200).json({success: false, message: "Unauthenticated"});
        }
    
        try {
            const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
            if (tokenDecode.id) {
                req.userId = tokenDecode.id;
            } else {
                return res.status(200).json({success: false, message: "Unauthenticated"});
            }
            return res.status(200).json({success: true, message: "Authenticated"});
        } catch (error) {
            console.error("Error in userAuth:", error);
            return res.status(500).json({ message: "Error in userAuth" });   
        }
};

//send password reset OTP
export const sendResetOtp= async (req, res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success:false, message: 'Email is required'})
    }
    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message:'User not found'});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() +  15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}. Use this OTP to proceed with resetting your password.`,
        };

        await transporter.sendMail(mailOption);

        return res.json({success: true, message:'OTP was sent to your email!'});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Reset user password

export const resetPassword= async(req, res)=>{
    const{email, otp, newPassword}= req.body;

    if(!email|| !otp || !newPassword){
        return res.json({success: false, message: 'Email, OTP, and new password are required'});
    }

    try {
        
        const user= await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message:'User not found'});
        }

        if(user.resetOtp===""|| user.resetOtp!== otp){
            return res.json({success: false, message:'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message:'OTP Expired'});;
        }

        const hashedPassword= await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp ='';
        user.resetOtpExpireAt= 0

        await user.save();

        return res.json({success: true , message:'Password has been reset successfully'});

    } catch (error) {
        return res.json({success: false, message: error.message}); 
    }
}