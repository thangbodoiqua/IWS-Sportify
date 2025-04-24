import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";
import userModel from "../models/userModel.js";
// import transporter from "../config/nodemailer.js";

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

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        })

        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // Send welcome email
        // const mailOptions = {
        //     from: process.env.SENDER_EMAIL,
        //     to: email,
        //     subject: "Welcome to Our Service",
        //     text: `Hi ${name},\n\nThank you for registering! We're glad to have you on board.\n\nBest regards,\nThe Team`,
        // };

        // await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Register successful"});

    } catch (error) {
        return res.status(500).json({ message: "Register error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email invalid"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Wrong passord"});
        }

        const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        
        return res.json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Login error" });
    }
}

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
}

export const isAuthenticated = async (req, res) => {
    try {
        res.status(200).json({success: true});
    } catch (error) {
        res.status(500).json({success: false, message: "unauthenticated" + error.message})
    }

}