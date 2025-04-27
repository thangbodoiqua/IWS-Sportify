// path: server/src/routes/albumRoute.js

import express from 'express';
import { adminAuth } from '../middleware/authMiddleWare.js'; // Sử dụng adminAuth để quản lý album
import {
  createAlbum,
  deleteAlbum,
  addSongToAlbum,
  removeSongFromAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
} from '../controllers/albumController.js';

const albumRoute = express.Router();

// Route để tạo album mới (có middleware xử lý file)
albumRoute.post('/create-album', adminAuth, createAlbum);

// Route để xóa album theo ID
albumRoute.delete('/:albumId',adminAuth, deleteAlbum);

// Route để thêm bài hát vào album
albumRoute.post('/add-song', adminAuth, addSongToAlbum);

// Route để xóa bài hát khỏi album
albumRoute.post('/remove-song', adminAuth, removeSongFromAlbum);

// Route để lấy thông tin tất cả các album
albumRoute.get('/', getAllAlbums);

// Route để lấy thông tin chi tiết của một album theo ID
albumRoute.get('/:albumId', getAlbumById);

// Route để cập nhật thông tin của một album (có middleware xử lý file)
albumRoute.put('/:albumId', adminAuth, updateAlbum);

export default albumRoute;