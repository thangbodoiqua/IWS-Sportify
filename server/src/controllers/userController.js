import userModel from "../models/userModel.js";

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