import express from 'express';
import { userAuth, adminAuth } from '../middleware/authMiddleWare.js';
import { createSong, getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs } from '../controllers/songController.js'
const songRoute = express.Router();

songRoute.post('/create-song', userAuth, adminAuth, createSong);
songRoute.get('/', getAllSongs);
songRoute.get('/featured', getFeaturedSongs);
songRoute.get('/made-for-yu', getMadeForYouSongs);
songRoute.get('/trending', getTrendingSongs);


export default songRoute;