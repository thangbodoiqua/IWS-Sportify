import { SongModel } from '../models/songModel.js';
import AlbumModel from '../models/albumModel.js';
import userModel from '../models/userModel.js';
import Artist from '../models/artistModel.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Lấy danh sách tất cả các bài hát, loại trừ trường 'audioUrl'
        const songs = await SongModel.find({}, '-audioUrl');
        const albums = await AlbumModel.find();
        const totalSongs = await SongModel.countDocuments();
        const totalAlbums = await AlbumModel.countDocuments();
        const totalArtists = await Artist.countDocuments();
        const totalUsers = await userModel.countDocuments();

        res.json({
            totalSongs,
            albums,
            totalAlbums,
            totalUsers,
            totalArtists,
            songs, 
        });

    } catch (err) {
        console.error('[AdminController] Error getting dashboard stats:', err);
        res.status(500).json({ error: 'Failed to load dashboard stats' });
    }
};