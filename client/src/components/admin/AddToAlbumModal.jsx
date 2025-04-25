import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';

const AddToAlbumModal = ({ song, albums, onClose, onAddToAlbumConfirmed }) => {
    const [selectedAlbums, setSelectedAlbums] = useState([]);
    const [availableAlbums, setAvailableAlbums] = useState([]);

    useEffect(() => {
        if (song && albums) {
            // Lọc ra các album mà bài hát chưa thuộc về
            const songAlbumsIds = song.albums ? song.albums.map(album => album._id) : [];
            const filteredAlbums = albums.filter(album => !songAlbumsIds.includes(album._id));
            setAvailableAlbums(filteredAlbums);
            setSelectedAlbums([]); // Reset lựa chọn khi mở modal cho bài hát mới
        }
    }, [song, albums]);

    const handleCheckboxChange = (albumId) => {
        setSelectedAlbums(prev => {
            if (prev.includes(albumId)) {
                return prev.filter(id => id !== albumId);
            } else {
                return [...prev, albumId];
            }
        });
    };

    const handleAddToAlbum = async () => {
        if (song && selectedAlbums.length > 0 && onAddToAlbumConfirmed) {
            try {
                console.log("Song ID:", song._id);
                console.log("Selected Album IDs:", selectedAlbums);
    
                // Gửi request cho từng album được chọn
                await Promise.all(
                    selectedAlbums.map(async (albumId) => {
                        const response = await axiosInstance.post(`/api/album/add-song`, { songId: song._id, albumId });
                    })
                );
    
                toast.success(`Added to albums successfully`);
                onAddToAlbumConfirmed(); // Gọi callback thông báo thành công
                onClose();
            } catch (error) {
                console.error('Error adding song to albums:', error);
                toast.error('Error adding song to albums');
                // Xử lý lỗi chi tiết hơn nếu cần
                if (error.response) {
                    console.error('Error Response Data:', error.response.data);
                    console.error('Error Response Status:', error.response.status);
                }
            }
        } else {
            onClose(); // Đóng modal nếu không có album nào được chọn
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Add "{song?.title}" to Album</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                {availableAlbums.length > 0 ? (
                    <div className="mb-4">
                        <h6 className="text-gray-300 mb-2">Select albums:</h6>
                        <ul className="space-y-2">
                            {availableAlbums.map(album => (
                                <li key={album._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`album-${album._id}`}
                                        value={album._id}
                                        checked={selectedAlbums.includes(album._id)}
                                        onChange={() => handleCheckboxChange(album._id)}
                                        className="mr-2 form-checkbox rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`album-${album._id}`} className="text-white">{album.title}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400 mb-4">This song is already in all available albums.</p>
                )}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                        Cancel
                    </button>
                    <button onClick={handleAddToAlbum} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none" disabled={selectedAlbums.length === 0 && availableAlbums.length > 0}>
                        Add to Albums
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToAlbumModal;