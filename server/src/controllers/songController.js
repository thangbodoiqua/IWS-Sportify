    import { SongModel } from '../models/songModel.js';
    import cloudinary from '../config/cloudinary.js';
    import AlbumModel from '../models/albumModel.js'; // Import AlbumModel
    import mongoose from 'mongoose'; // Cần import mongoose để tạo ObjectId

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
        console.log("Creating song with data:", req.body);
        console.log("Received files:", req.files);
    
        // Lưu trữ các URL Cloudinary để xóa nếu có lỗi sau này
        let audioUrl = null;
        let imageUrl = null;
    
        try {
            // 1. Kiểm tra file upload
            if (!req.files || !req.files.audioFile || !req.files.imageFile) {
                console.error('File upload missing.');
                return res.status(400).json({ message: 'Please upload both audio and image files' });
            }
    
            // 2. Lấy dữ liệu từ body
            // duration là giá trị gửi từ frontend (đã là số giây, nhưng có thể nhận ở backend dưới dạng string)
            const { title, artist, albumId, duration } = req.body;
    
            const audioFile = req.files.audioFile;
            const imageFile = req.files.imageFile;
    
            // Basic validation cho các trường bắt buộc (ngoài files)
            if (!title || !artist || duration === undefined || duration === null || duration === '') {
                 console.error('Missing required body fields (title, artist, or duration).');
                 return res.status(400).json({ message: 'Missing required fields: title, artist, or duration.' });
            }
    
            // *** Xử lý và kiểm tra Duration (ĐÃ SỬA để chắc chắn là số) ***
            console.log(`Received duration: ${duration} (type: ${typeof duration})`);
            // Chuyển đổi giá trị nhận được sang số TRƯỚC KHI kiểm tra
            const numericDuration = Number(duration); // Sử dụng Number() để chuyển đổi
            console.log(`Parsed numeric duration: ${numericDuration} (type: ${typeof numericDuration})`);
    
            // Kiểm tra xem kết quả chuyển đổi có phải là số hợp lệ và không âm không
            if (isNaN(numericDuration) || numericDuration < 0) {
                 console.error('Invalid duration value after parsing or negative duration.');
                 return res.status(400).json({ message: 'Invalid duration value provided. Must be a non-negative number.' });
            }
            // *******************************************
    
    
            // 3. Upload files lên Cloudinary
            console.log('Starting Cloudinary uploads...');
            // Đảm bảo hàm uploadToCloudinary nhận resource_type và folder
            audioUrl = await uploadToCloudinary(audioFile, 'video', 'song_audio'); // resource_type 'video' cho audio
            imageUrl = await uploadToCloudinary(imageFile, 'image', 'song_images');
            console.log(`Cloudinary uploads complete. Audio URL: ${audioUrl}, Image URL: ${imageUrl}`);
    
    
            // 4. Chuẩn bị mảng 'albums' cho Song mới
            const songAlbums = [];
            if (albumId && albumId !== '') {
                console.log(`albumId provided: ${albumId}`);
                // Kiểm tra xem albumId có phải là ObjectId hợp lệ không
                if (!mongoose.Types.ObjectId.isValid(albumId)) {
                    console.error(`Invalid albumId format: ${albumId}`);
                    // TODO: Xóa các file đã upload nếu albumId không hợp lệ
                    // if (audioUrl) deleteFromCloudary(audioUrl); // Cần public_id
                    // if (imageUrl) deleteFromCloudary(imageUrl); // Cần public_id
                    return res.status(400).json({ message: "Invalid album ID format provided" });
                }
                // Thêm albumId vào mảng albums dưới dạng ObjectId
                songAlbums.push(new mongoose.Types.ObjectId(albumId));
                console.log(`Added albumId ${albumId} to songAlbums array.`);
            } else {
                 console.log('No albumId provided.');
            }
    
    
            // 5. Tạo document Song mới với schema đã cập nhật
            console.log('Creating new SongModel instance...');
            const song = new SongModel({
                title,
                artist,
                audioUrl,
                imageUrl,
                duration: numericDuration, // Sử dụng giá trị số đã kiểm tra và chuyển đổi
                albums: songAlbums, // Gán mảng albums
            });
            console.log('SongModel instance created:', song);
    
    
            // 6. Lưu document Song vào database
            console.log('Saving song to database...');
            const savedSong = await song.save();
            console.log('Song saved successfully:', savedSong._id);
    
    
            // 7. Nếu có albumId được cung cấp, cập nhật Album tương ứng
            if (albumId && albumId !== '') {
                console.log(`Attempting to add song ${savedSong._id} to album ${albumId}...`);
                try {
                    // Tìm Album và thêm ID của Song mới vào mảng 'songs' của Album
                    // Sử dụng findByIdAndUpdate với $push để thêm phần tử vào mảng
                    const album = await AlbumModel.findByIdAndUpdate(
                        albumId,
                        { $push: { songs: savedSong._id } }, // Thêm ID của bài hát mới vào mảng songs của album
                        { new: true } // Tùy chọn: trả về album đã cập nhật
                    );
    
                    if (!album) {
                        console.warn(`Album with ID ${albumId} not found when trying to add song ${savedSong._id}. Song was created successfully but not added to album's song list.`);
                    } else {
                         console.log(`Song ${savedSong._id} successfully added to album ${albumId}'s song list.`);
                    }
                } catch (albumUpdateError) {
                    console.error(`Error adding song ${savedSong._id} to album ${albumId}'s song list:`, albumUpdateError);
                }
            }
    
            // 8. Trả về phản hồi thành công
            console.log('Song creation process finished successfully.');
            res.status(201).json({
                success: true,
                message: "Song created successfully",
                song: savedSong // Trả về document Song đã lưu (có mảng albums)
            });
    
        } catch (error) {
            console.error('An error occurred during song creation:', error);
    
            // TODO: Nếu có lỗi xảy ra sau khi upload lên Cloudinary, cần xóa các file đã upload
            // Cần public_id để xóa. Hàm uploadToCloudinary cần trả về public_id.
            // if (audioUrl) { deleteFromCloudinary(audioUrl); }
            // if (imageUrl) { deleteFromCloudinary(imageUrl); }
    
            next(error); // Chuyển lỗi đến middleware xử lý lỗi nếu có
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
                    $sample: { size: 15 }
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
            //fetch 4 rand songs
            const songs = await SongModel.aggregate([
                {
                    $sample: { size: 5 }
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

    export async function getTrendingSongs(req, res, next) {
        try {
            //fetch 6 rand songs
            const songs = await SongModel.aggregate([
                {
                    $sample: { size: 10 }
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

    export async function deleteSong(req, res, next) {
        try {
            console.log("deleteSong", req.params.songId);
            const songId = req.params.songId;
            const song = await SongModel.findById(songId);

            if (!song) {
                return res.status(404).json({ message: 'Song not found' });
            }

            // Xóa bài hát khỏi album (nếu có)
            if (song.albumId) {
                try {
                    await AlbumModel.findByIdAndUpdate(
                        song.albumId,
                        { $pull: { songs: songId } }
                    );
                } catch (error) {
                    console.error('Error removing song from album:', error);
                    // Không làm gián đoạn việc xóa bài hát chính
                }
            }

            // const audioPublicId = extractPublicId(song.audioUrl);
            // const imagePublicId = extractPublicId(song.imageUrl);
            // if (audioPublicId) {
            //     await cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' });
            // }
            // if (imagePublicId) {
            //     await cloudinary.uploader.destroy(imagePublicId);
            // }

            await SongModel.findByIdAndDelete(songId);

            res.status(200).json({
                success: true,
                message: 'Song deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting song:', error);
            next(error);
        }
    }

    // function extractPublicId(url) {
    //     const parts = url.split('/');
    //     const filenameWithExtension = parts[parts.length - 1];
    //     const filename = filenameWithExtension.split('.')[0];
    //     return filename;
    // }