import express from 'express';
import { userAuth, adminAuth } from '../middleware/authMiddleWare.js';
import { createSong, getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, deleteSong } from '../controllers/songController.js'
const songRoute = express.Router();

songRoute.post('/create-song', userAuth, adminAuth, createSong);
songRoute.get('/', getAllSongs);
songRoute.get('/featured', getFeaturedSongs);
songRoute.get('/made-for-you', getMadeForYouSongs);
songRoute.get('/trending', getTrendingSongs);
songRoute.delete('/:songId', userAuth, adminAuth, deleteSong); // Thêm route xóa bài hát

export default songRoute;