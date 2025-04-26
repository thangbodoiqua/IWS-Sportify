import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
export const getUserData = async (req, res) => {
    try {
        const { userId } = req;
        const user = await userModel.findById(userId);    
        const isAdmin = user.email === process.env.ADMIN_EMAIL; 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            userData: {
                username: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin
            }
        })
    } catch (error) {
        console.error("Error in getUserData:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();

        res.json({
            totalUsers,
        });

    } catch (err) {
        console.error('[AdminController] Error getting dashboard stats:', err);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
};

export const updateUsername = async (req, res) => {
    console.log("start update:" + req.body)
    const { username } = req.body;
    console.log("ussername update:" + username)

    if (!username || username.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    try {
        console.log(req.userId)
        const updatedUser = await userModel.findByIdAndUpdate(
            req.userId,
            { name: username },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Username updated successfully', userData: updatedUser });
    } catch (error) {
        console.error("Error updating username:", error);
        return res.status(500).json({ message: 'Error updating username' });
    }
};

export const resetPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: 'Error resetting password' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Có thể thực hiện thêm các hành động sau khi xóa tài khoản (ví dụ: xóa dữ liệu liên quan)

        return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ message: 'Error deleting account' });
    }
};