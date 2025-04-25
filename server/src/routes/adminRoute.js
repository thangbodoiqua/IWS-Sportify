import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';

const AdminRouter = express.Router();

AdminRouter.get('/dashboard', getDashboardStats);

export default AdminRouter;
