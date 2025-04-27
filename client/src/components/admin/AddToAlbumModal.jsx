import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';

const AddToAlbumModal = ({ song, albums, onClose, onAddToAlbumConfirmed }) => {
    const [selectedAlbums, setSelectedAlbums] = useState([]);
    const [availableAlbums, setAvailableAlbums] = useState([]);

    // Trong AddToAlbumModal.js
useEffect(() => {
    // Đảm bảo song và albums data có sẵn
    if (song && albums) {
        console.log('Song passed to modal (with albums array):', song); // Log cấu trúc mới
        console.log('All Albums passed to modal:', albums);

        // *** LOGIC LỌC ĐÃ CẬP NHẬT CHO MẢNG song.albums ***
        // Lấy các ID của album mà bài hát hiện tại thuộc về.
        // song.albums bây giờ được kỳ vọng là một mảng các ID hoặc object Album.
        // Xử lý trường hợp song.albums có thể là null, undefined, hoặc mảng rỗng.
        const songAlbumsIds = Array.isArray(song.albums) ? song.albums.map(album => {
             // Map tùy thuộc vào việc backend populate hay chỉ gửi ID
             // Nếu backend populate, album là object { _id: '...', title: '...' } -> lấy album._id
             // Nếu backend không populate, album trong mảng song.albums chỉ là ID string -> lấy trực tiếp album
             return typeof album === 'object' && album !== null ? album._id : album;
        }) : []; // Sử dụng mảng rỗng nếu song.albums không phải mảng (ví dụ: null/undefined)

        console.log('Current song album IDs:', songAlbumsIds);


        // Lọc danh sách TẤT CẢ các album (albums prop).
        // Giữ lại một album nếu _id của nó KHÔNG nằm trong mảng songAlbumsIds.
        const filteredAlbums = albums.filter(album => {
            return !songAlbumsIds.includes(album._id);
        });

        console.log('Available albums after filtering (using song.albums array):', filteredAlbums);

        setAvailableAlbums(filteredAlbums);
        setSelectedAlbums([]); // Reset lựa chọn khi modal mở cho bài hát/albums prop thay đổi
    }
     // Thêm song?.albums vào dependency array vì logic lọc phụ thuộc vào nội dung của nó
}, [song, albums, song?.albums]);


    const handleCheckboxChange = (albumId) => {
        setSelectedAlbums(prev => {
            if (prev.includes(albumId)) {
                // Xóa albumId nếu đã chọn
                return prev.filter(id => id !== albumId);
            } else {
                // Thêm albumId nếu chưa chọn
                return [...prev, albumId];
            }
        });
    };

    const handleAddToAlbum = async () => {
        // Vẫn cho phép chọn nhiều album ở frontend nếu backend API hỗ trợ thêm bài hát vào album
        // Tuy nhiên, với cấu trúc songModel chỉ có albumId, việc thêm vào nhiều album
        // thông qua API /api/album/add-song sẽ cần backend xử lý logic bổ sung (ví dụ:
        // thêm songId vào mảng songs của nhiều album mà không cập nhật albumId trên song)
        // hoặc bạn cần thay đổi backend để thực sự hỗ trợ many-to-many.

        if (song && selectedAlbums.length > 0 && onAddToAlbumConfirmed) {
            try {
                // Gửi request để thêm bài hát vào các album đã chọn
                // Endpoint /api/album/add-song này ngụ ý backend đang thêm songId vào mảng songs của Album.
                // Cần chắc chắn backend xử lý đúng logic này và không bị lỗi khi thêm trùng.

                await Promise.all(
                    selectedAlbums.map(async (albumId) => {
                        console.log(`Attempting to add song ${song._id} to album ${albumId}`);
                        // Đảm bảo endpoint backend /api/album/add-song tồn tại và hoạt động như mong đợi
                        await axiosInstance.post(`/api/album/add-song`, { songId: song._id, albumId });
                    })
                );

                toast.success(`Added song to selected album(s) successfully!`);
                onAddToAlbumConfirmed(); // Gọi callback để refresh data trên dashboard
                onClose(); // Đóng modal
            } catch (error) {
                console.error('Error adding song to albums:', error);

                let errorMessage = 'Error adding song to album(s)';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message; // Sử dụng thông báo lỗi từ backend
                } else if (error.message) {
                     errorMessage = error.message;
                }
                toast.error(errorMessage);

                 // Có thể cần fetch lại dashboard data ngay cả khi có lỗi
                 // để hiển thị trạng thái hiện tại sau các thao tác (nếu onAddToAlbumConfirmed
                 // không làm điều này VÀ bạn muốn thấy trạng thái sau khi thêm thành công một phần).
            }
        } else {
             // Nếu không có album nào được chọn, chỉ đóng modal
             onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"> {/* Added p-4 for padding on small screens */}
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Add "{song?.title}" to Album</h2>
                    <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
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
                                        className="cursor-pointer mr-2 form-checkbox rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`album-${album._id}`} className="text-white cursor-pointer">{album.title}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    // Thông báo cập nhật để phản ánh việc lọc dựa trên albumId duy nhất
                    <p className="text-gray-400 mb-4">This song is already assigned to an album or there are no other albums available.</p>
                )}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-600 cursor-pointer hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                        Cancel
                    </button>
                    <button
                        onClick={handleAddToAlbum}
                        className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none ${selectedAlbums.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selectedAlbums.length === 0} // Disable nút nếu không chọn album nào
                    >
                         {selectedAlbums.length === 0 ? 'Select Album(s)' : 'Add to Albums'} {/* Text nút thay đổi */}
                    </button>
                </div>
            </div>
             {/* CSS for custom scrollbar */}
             <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #303030;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }

                /* Firefox scrollbar styles */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #555 #303030;
                }
            `}</style>
        </div>
    );
};

export default AddToAlbumModal;