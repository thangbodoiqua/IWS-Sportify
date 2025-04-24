import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config(); // Đảm bảo load biến môi trường
export const userAuth = async (req, res, next) => { 

    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
        
    } catch (error) {
        console.error("Error in userAuth:", error);
        return res.status(500).json({ message: "Error in userAuth" });   
    }
}

export const adminAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Check email trùng với ADMIN_EMAIL từ .env
        if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
            req.userId = decoded.id; // lưu lại id để dùng sau nếu cần
            return next();
        }

        return res.status(403).json({ message: "Forbidden: Not an admin" });

    } catch (error) {
        console.error("Error in adminAuth:", error);
        return res.status(500).json({ message: "Error verifying token" });   
    }
};