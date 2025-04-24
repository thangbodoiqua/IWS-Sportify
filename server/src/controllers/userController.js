import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req;
        const user = await userModel.findById(userId);    

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            userData: {
                username: user.name,
                email: user.email,
                phone: user.phone,
            }
        })
    } catch (error) {
        console.error("Error in getUserData:", error);
        return res.status(500).json({ message: "Server error" });
    }
};