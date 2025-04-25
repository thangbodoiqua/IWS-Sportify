import express from 'express';
import { adminAuth, userAuth } from '../middleware/authMiddleWare.js';
import { getUserData, getUsers } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/', userAuth, adminAuth, getUsers);

export default userRouter;