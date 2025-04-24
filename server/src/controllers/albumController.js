// path: server/src/controllers/albumController.js

import AlbumModel from "../models/albumModel.js";
import { SongModel } from "../models/songModel.js";
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'image', // Chỉ định là image
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary (album cover):', error);
    throw new Error('Failed to upload album cover to Cloudinary');
  }
};

export const createAlbum = async (req, res) => {
  console.log("Creating album with data:", req.body);
  try {
    const { title, description, songIds } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Please provide a title for the album" });
    }

    if (!req.files || !req.files.coverFile) {
      return res.status(400).json({ message: "Please upload an album cover image" });
    }

    const coverUrl = await uploadToCloudinary(req.files.coverFile);

    if (songIds && songIds.length > 0) {
      const existingSongs = await SongModel.find({ _id: { $in: songIds } });
      if (existingSongs.length !== songIds.length) {
        return res.status(400).json({ message: "One or more song IDs are invalid" });
      }
    }

    const newAlbum = new AlbumModel({
      title,
      coverUrl,
      description,
      songs: songIds || [],
    });

    const savedAlbum = await newAlbum.save();

    return res.status(201).json({
      success: true,
      message: "Album created successfully",
      album: savedAlbum,
    });
  } catch (error) {
    console.error("Error creating album:", error);
    return res.status(500).json({ message: "Failed to create album" });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    const deletedAlbum = await AlbumModel.findByIdAndDelete(albumId);

    if (!deletedAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    // TODO: Xóa ảnh bìa khỏi Cloudinary nếu cần

    return res.status(200).json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    console.error("Error deleting album:", error);
    return res.status(500).json({ message: "Failed to delete album" });
  }
};

export const addSongToAlbum = async (req, res) => {
  try {
    const { albumId, songId } = req.body;

    const album = await AlbumModel.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const song = await SongModel.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (album.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already exists in the album" });
    }

    album.songs.push(songId);
    await album.save();

    return res.status(200).json({ success: true, message: "Song added to album successfully", album });
  } catch (error) {
    console.error("Error adding song to album:", error);
    return res.status(500).json({ message: "Failed to add song to album" });
  }
};

export const removeSongFromAlbum = async (req, res) => {
  console.log("Removing song from album with data:", req.body);
  try {
    const { albumId, songId } = req.body;

    const album = await AlbumModel.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    album.songs = album.songs.filter(id => id.toString() !== songId);
    await album.save();

    return res.status(200).json({ success: true, message: "Song removed from album successfully", album });
  } catch (error) {
    console.error("Error removing song from album:", error);
    return res.status(500).json({ message: "Failed to remove song from album" });
  }
};

export const getAllAlbums = async (req, res) => {
  try {
    const albums = await AlbumModel.find().populate('songs', 'title artist imageUrl audioUrl duration'); // Populate thông tin bài hát
    return res.status(200).json({ success: true, albums });
  } catch (error) {
    console.error("Error fetching all albums:", error);
    return res.status(500).json({ message: "Failed to fetch all albums" });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await AlbumModel.findById(albumId).populate('songs', 'title artist imageUrl audioUrl duration');
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    return res.status(200).json({ success: true, album });
  } catch (error) {
    console.error("Error fetching album by ID:", error);
    return res.status(500).json({ message: "Failed to fetch album" });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { title, description, songIds } = req.body;
    let updateData = { title, description, updatedAt: Date.now() };

    if (req.files && req.files.coverFile) {
      updateData.coverUrl = await uploadToCloudinary(req.files.coverFile);
      // TODO: Xóa ảnh bìa cũ khỏi Cloudinary nếu cần
    }

    if (songIds) {
      const existingSongs = await SongModel.find({ _id: { $in: songIds } });
      if (existingSongs.length !== songIds.length) {
        return res.status(400).json({ message: "One or more song IDs are invalid" });
      }
      updateData.songs = songIds;
    }

    const updatedAlbum = await AlbumModel.findByIdAndUpdate(
      albumId,
      updateData,
      { new: true }
    ).populate('songs', 'title artist imageUrl audioUrl duration');

    if (!updatedAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    return res.status(200).json({ success: true, message: "Album updated successfully", album: updatedAlbum });
  } catch (error) {
    console.error("Error updating album:", error);
    return res.status(500).json({ message: "Failed to update album" });
  }
};