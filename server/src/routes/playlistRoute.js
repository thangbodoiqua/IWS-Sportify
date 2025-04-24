import express from 'express';
import { userAuth } from '../middleware/authMiddleware.js'; // Đã sửa tên file middleware
import {
    createPlaylist,
    getUserPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
} from '../controllers/playlistController.js';

const playlistRoute = express.Router();

playlistRoute.use(userAuth);

// Middleware userAuth áp dụng cho tất cả các route dưới đây, đảm bảo chỉ người dùng đã đăng nhập mới có thể truy cập
// Route để tạo playlist mới
playlistRoute.post('/create-playlist' , createPlaylist);

// Route để lấy tất cả playlist của người dùng hiện tại
playlistRoute.get('/', getUserPlaylists);

// Route để lấy thông tin chi tiết của một playlist theo ID
playlistRoute.get('/:playlistId', getPlaylistById);

// Route để thêm bài hát vào playlist
playlistRoute.post('/add-song', addSongToPlaylist);

// Route để xóa bài hát khỏi playlist
playlistRoute.delete('/remove-song', removeSongFromPlaylist);

// Route để cập nhật thông tin của một playlist
playlistRoute.put('/:playlistId', updatePlaylist);

// Route để xóa một playlist
playlistRoute.delete('/:playlistId', deletePlaylist);

export default playlistRoute;
