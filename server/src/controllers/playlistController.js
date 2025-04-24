import PlaylistModel from "../models/playlistModel.js";
import { SongModel } from "../models/songModel.js";

export const createPlaylist = async (req, res) => {
    try {
        const { name, description, songIds } = req.body;

        const userId = req.userId; // Lấy userId từ req

        if (!name) {
            return res.status(400).json({ message: "Please provide a name for the playlist" });
        }

        if (songIds && songIds.length > 0) {

            const existingSongs = await SongModel.find({ _id: { $in: songIds } });
            if (existingSongs.length !== songIds.length) {
                return res.status(400).json({ message: "One or more song IDs are invalid" });
            }
        }
        const newPlaylist = new PlaylistModel({
            name,
            description,
            userId: userId,
            songs: songIds || [],
        });
        const savedPlaylist = await newPlaylist.save();

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            playlist: savedPlaylist,
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        return res.status(500).json({ message: "Failed to create playlist" });
    }
};

export const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.userId;
        const playlists = await PlaylistModel.find({ userId: userId }).populate('songs', 'title artist imageUrl audioUrl'); // Populate thông tin bài hát
        return res.status(200).json({ success: true, playlists });
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        return res.status(500).json({ message: "Failed to fetch user playlists" });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        const userId = req.userId;
        const playlist = await PlaylistModel.findOne({ _id: playlistId, userId: userId });

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or does not belong to the user" });
        }
        const song = await SongModel.findById(songId);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: "Song already exists in the playlist" });
        }

        playlist.songs.push(songId);
        await playlist.save();

        return res.status(200).json({ success: true, message: "Song added to playlist successfully", playlist });
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        return res.status(500).json({ message: "Failed to add song to playlist" });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        const userId = req.userId;

        const playlist = await PlaylistModel.findOne({ _id: playlistId, userId: userId });
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or does not belong to the user" });
        }

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        return res.status(200).json({ success: true, message: "Song removed from playlist successfully", playlist });
    } catch (error) {
        console.error("Error removing song from playlist:", error);
        return res.status(500).json({ message: "Failed to remove song from playlist" });
    }
};

export const getPlaylistById = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.userId;

        const playlist = await PlaylistModel.findOne({ _id: playlistId, userId: userId }).populate('songs');
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found or does not belong to the user" });
        }

        return res.status(200).json({ success: true, playlist });
    } catch (error) {
        console.error("Error fetching playlist by ID:", error);
        return res.status(500).json({ message: "Failed to fetch playlist" });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { name, description } = req.body;
        const userId = req.userId;

        const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
            { _id: playlistId, user: userId },
            { name, description, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedPlaylist) {
            return res.status(404).json({ message: "Playlist not found or does not belong to the user" });
        }

        return res.status(200).json({ success: true, message: "Playlist updated successfully", playlist: updatedPlaylist });
    } catch (error) {
        console.error("Error updating playlist:", error);
        return res.status(500).json({ message: "Failed to update playlist" });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.userId;

        const deletedPlaylist = await PlaylistModel.findOneAndDelete({ _id: playlistId, userId: userId });

        if (!deletedPlaylist) {
            return res.status(404).json({ message: "Playlist not found or does not belong to the user" });
        }

        return res.status(200).json({ success: true, message: "Playlist deleted successfully" });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return res.status(500).json({ message: "Failed to delete playlist" });
    }
};