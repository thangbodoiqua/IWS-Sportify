import express from 'express';
import { register, login, logout, isAuthenticated } from '../controllers/authController.js';
import { userAuth } from '../middleware/authMiddleWare.js';

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', userAuth, logout);
authRoute.get('/is-auth', userAuth, isAuthenticated)

export default authRoute;