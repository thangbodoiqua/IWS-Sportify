// path: server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fileUpload from 'express-fileupload';
import connectDB from './src/config/mongodb.js';
import authRoute from './src/routes/authRoute.js';
import userRoute from './src/routes/userRoute.js';
import songRoute from './src/routes/songRoute.js';
import playlistRoute from './src/routes/playlistRoute.js';
import albumRoute from './src/routes/albumRoute.js'; // Import albumRoute
import adminRoutes from './src/routes/adminRoute.js'; // Import adminRoutes
dotenv.config();
connectDB();

const port = process.env.PORT;
const app = express();
const __dirname = path.resolve();
const allowedOrigin = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'src/utils'),
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}));

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('cdb' + process.env.ADMIN_EMAIL);
});
app.use('/api/admin', adminRoutes);

app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/song', songRoute)
app.use('/api/playlist', playlistRoute)
app.use('/api/album', albumRoute) // Sử dụng albumRoute

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});