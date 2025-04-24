import { SongModel } from '../models/songModel.js';
import cloudinary from '../config/cloudinary.js';
import AlbumModel from '../models/albumModel.js'; // Import AlbumModel

const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: 'auto',
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error in uploadToCloudinary:', error);
        throw new Error('Failed to upload file to Cloudinary');
    }
}

export async function createSong(req, res, next) {
    try {
        if (!req.files || !req.files.audioFile || !req.files.imageFile) {
            return res.status(400).json({ message: 'Please upload all files' });
        }
        const { title, artist, albumId, duration } = req.body;
        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new SongModel({
            title,
            artist,
            audioUrl,
            imageUrl,
            duration,
            albumId: albumId || null,
        });

        await song.save();

        if (albumId) {
            try {
                const album = await AlbumModel.findByIdAndUpdate(
                    albumId,
                    { $push: { songs: song._id } },
                    { new: true } // Để trả về album đã cập nhật (tùy chọn)
                );

                if (!album) {
                    console.warn(`Album with ID ${albumId} not found when trying to add song.`);
                    // Không trả về lỗi 404 ở đây, vì việc tạo bài hát vẫn thành công
                }
            } catch (error) {
                console.error('Error adding song to album:', error);
                // Ghi log lỗi, nhưng không làm gián đoạn việc tạo bài hát
            }
        }

        res.status(201).json({
            success: true,
            message: "Song created",
            song
        });
    } catch (error) {
        console.error('Error creating song:', error);
        next(error);
    }
}

export async function getAllSongs(req, res, next) {
    try {
        const songs = await SongModel.find().sort({ createdAt: -1 });
        res.status(200).json(songs);
    } catch (error) {
        next(error);   
    }
}

export async function getFeaturedSongs(req, res, next) {
    try {
        //fetch 6 rand songs
        const songs = await SongModel.aggregate([
            {
                $sample: {size: 6}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])

        res.json(songs);
    } catch (error) {
        console.log("getFeaturedSongs", error);
        next(error);
    }
}

export async function getMadeForYouSongs(req, res, next) {
    try {
        //fetch 6 rand songs
        const songs = await SongModel.aggregate([
            {
                $sample: {size: 4}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])

        res.json(songs);
    } catch (error) {
        console.log("getMadeForYouSongs", error);
        next(error);
    }
}

export  async function getTrendingSongs(req, res, next) {
    try {
        //fetch 6 rand songs
        const songs = await SongModel.aggregate([
            {
                $sample: {size: 6}
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])

        res.json(songs);
    } catch (error) {
        console.log("getTrendingSongs", error);
        next(error);
    }
}
