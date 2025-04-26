import express from 'express';
import { adminAuth, userAuth } from '../middleware/authMiddleWare.js';
import { getUserData, getUsers, updateUsername, resetPassword, deleteUser } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData); // Có nên đổi ở đây thành /:id?
userRouter.get('/', userAuth, adminAuth, getUsers);
userRouter.put('/update-username', userAuth, updateUsername);
userRouter.put('/reset-password', userAuth, resetPassword);
userRouter.delete('/delete', userAuth, deleteUser);

export default userRouter;