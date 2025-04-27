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

      // Find Album and Song concurrently
      const [album, song] = await Promise.all([
          AlbumModel.findById(albumId),
          SongModel.findById(songId)
      ]);

      if (!album) {
          return res.status(404).json({ message: "Album not found" });
      }

      if (!song) {
          return res.status(404).json({ message: "Song not found" });
      }

      // --- Check for duplicate on the Song model's albums array ---
      // Check if the albumId is already in the song's albums array
      // Mongoose will compare ObjectIds correctly even if one is a string ID.
      if (song.albums.includes(albumId)) {
           // You might want to return a 409 Conflict or 400 Bad Request
           return res.status(400).json({ message: "Song is already in this album (checked on song model)" });
      }

      // --- Optional: Also check for duplicate on the Album model's songs array ---
      // Keep this check if AlbumModel has a 'songs' array and you want to be robust
      if (album.songs && album.songs.includes(songId)) {
          return res.status(400).json({ message: "Song already exists in the album (checked on album model)" });
      }


      // --- Update both Album and Song models ---

      // Add the song ID to the album's songs array (assuming AlbumModel has 'songs')
      // Make sure album.songs is initialized if it might be undefined
      if (!album.songs) {
          album.songs = [];
      }
      album.songs.push(songId);


      // Add the album ID to the song's albums array (NEW step based on songModel)
      // Make sure song.albums is initialized if it might be undefined
       if (!song.albums) {
           song.albums = [];
       }
      song.albums.push(albumId);


      // Save both updated documents concurrently
      await Promise.all([
          album.save(),
          song.save() // Save the updated song document
      ]);


      return res.status(200).json({ success: true, message: "Song added to album successfully" }); // Removed returning album object as it's less common/needed here
  } catch (error) {
      console.error("Error adding song to album:", error);
      return res.status(500).json({ message: "Failed to add song to album" });
  }
};

export const removeSongFromAlbum = async (req, res) => {
  console.log("Removing song from album with data:", req.body);
  try {
      const { albumId, songId } = req.body;

      // Cần tìm cả Album và Song để cập nhật cả hai document
      const [album, song] = await Promise.all([
          AlbumModel.findById(albumId),
          SongModel.findById(songId)
      ]);

      // Kiểm tra xem có tìm thấy cả hai không
      if (!album) {
          return res.status(404).json({ message: "Album not found" });
      }

       if (!song) {
           return res.status(404).json({ message: "Song not found" });
       }


      // --- Bước 1: Xóa songId khỏi mảng songs của Album ---
      // Filter mảng songs của album để loại bỏ songId.
      const initialAlbumSongsLength = album.songs ? album.songs.length : 0;
      let albumSongsRemoved = false; // Cờ để kiểm tra xem có xóa được reference trên album không
      if (album.songs) { // Đảm bảo AlbumModel có trường songs và nó là mảng
           const filteredSongs = album.songs.filter(id => id.toString() !== songId.toString());
           if (filteredSongs.length < initialAlbumSongsLength) {
               album.songs = filteredSongs;
               albumSongsRemoved = true; // Có thay đổi trên album
           }
      }


      // --- Bước 2: XÓA albumId khỏi mảng albums của Song (BỔ SUNG) ---
      // Filter mảng albums của song để loại bỏ albumId.
      const initialSongAlbumsLength = song.albums ? song.albums.length : 0;
      let songAlbumsRemoved = false; // Cờ để kiểm tra xem có xóa được reference trên song không
       if (song.albums && Array.isArray(song.albums)) { // Đảm bảo song.albums tồn tại và là mảng
           const filteredAlbums = song.albums.filter(id => id.toString() !== albumId.toString());
           if (filteredAlbums.length < initialSongAlbumsLength) {
               song.albums = filteredAlbums;
               songAlbumsRemoved = true; // Có thay đổi trên song
           }
       }
      // ********************************************************************


      // Chỉ lưu nếu có sự thay đổi (xóa được reference) trên ít nhất một trong hai document
      if (albumSongsRemoved || songAlbumsRemoved) {
           await Promise.all([
               albumSongsRemoved ? album.save() : Promise.resolve(), // Lưu album nếu có thay đổi
               songAlbumsRemoved ? song.save() : Promise.resolve() // Lưu song nếu có thay đổi
           ]);
           // Trả về thành công sau khi lưu
           return res.status(200).json({ success: true, message: "Song removed from album successfully" /*, album: updatedAlbum */ }); // Tùy chọn: có thể populate và trả về album nếu frontend cần update list
      } else {
           // Nếu không có gì để xóa (ví dụ: mối quan hệ không tồn tại ban đầu)
           // Bạn có thể coi đây là lỗi hoặc thành công tùy ý.
           // Trả về lỗi 400 Bad Request nếu mối quan hệ không tồn tại để xóa
           return res.status(400).json({ message: "Relationship not found between song and album." });
      }


  } catch (error) {
      console.error("Error removing song from album:", error);
      return res.status(500).json({ message: error.message || "Failed to remove song from album" });
  }
};

export const getAllAlbums = async (req, res) => {
  try {
    const albums = await AlbumModel.find().populate('songs', 'title artist imageUrl audioUrl duration'); 
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