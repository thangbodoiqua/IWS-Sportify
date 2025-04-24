import { SongModel } from '../models/songModel.js';
import  cloudinary  from '../config/cloudinary.js';

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

        if(albumId) {
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            });
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
