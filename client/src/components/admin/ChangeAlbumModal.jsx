import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';

const ChangeAlbumModal = ({ album, onClose, onSongsChanged }) => {
    const [songsToRemove, setSongsToRemove] = useState([]);
    // console.log(album) // Giữ lại log nếu cần debug

    const handleRemoveCheckboxChange = (songId) => {
        setSongsToRemove(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            } else {
                return [...prev, songId];
            }
        });
    };

    // Trong ChangeAlbumModal.js, thay thế hàm handleRemoveSongsFromAlbum hiện tại bằng đoạn này

const handleRemoveSongsFromAlbum = async () => {
    // Kiểm tra nếu không có album hoặc không chọn bài hát nào để xóa
    if (!album || songsToRemove.length === 0) {
        onClose(); // Chỉ đóng modal nếu không có gì để làm
        return;
    }

    let successfullyRemovedCount = 0; // Đếm số bài xóa thành công
    const songsFailedToRemove = []; // Lưu lại các bài hát xóa lỗi

    try {
        // *** BẮT ĐẦU VÒNG LẶP XÓA TỪNG BÀI HÁT MỘT CÁCH TUẦN TỰ ***
        console.log(`Attempting to remove ${songsToRemove.length} song(s) sequentially...`);

        for (const songId of songsToRemove) { // Lặp qua từng songId được chọn
            try {
                console.log(`Removing song ${songId} from album ${album._id}...`);
                // Gửi request xóa TỪNG bài hát một, đợi phản hồi trước khi sang bài tiếp theo
                const response = await axiosInstance.post('/api/album/remove-song', {
                    albumId: album._id,
                    songId: songId, // <-- Gửi MỘT ID bài hát mỗi lần gọi API
                });

                // Kiểm tra phản hồi thành công cho TỪNG request xóa riêng lẻ
                if (response.data.success) {
                    console.log(`Successfully removed song ${songId}.`);
                    successfullyRemovedCount++; // Tăng biến đếm
                    // Tùy chọn: Có thể cập nhật state hoặc UI ngay tại đây nếu muốn thấy hiệu ứng xóa từng bài
                } else {
                    // Ghi nhận lỗi nếu backend báo success: false cho bài hát này
                    console.error(`Backend reported failure for song ${songId}:`, response.data.message);
                    songsFailedToRemove.push({ songId, message: response.data.message });
                     // Tùy chọn: Nếu gặp lỗi nghiêm trọng và muốn dừng luôn, có thể throw error tại đây
                     // throw new Error(`Failed to remove song ${songId}: ${response.data.message}`);
                }
            } catch (error) {
                 // Bắt lỗi mạng hoặc lỗi khác cho TỪNG request riêng lẻ
                 console.error(`Error removing single song ${songId}:`, error);
                 let errorMessage = error.response?.data?.message || error.message || 'Unknown error';
                 songsFailedToRemove.push({ songId, message: errorMessage });
                 // Tùy chọn: Nếu gặp lỗi nghiêm trọng và muốn dừng luôn, có thể throw error tại đây
                 // throw new Error(`Error removing single song ${songId}: ${errorMessage}`);
            }
        }
        // *** KẾT THÚC VÒNG LẶP TUẦN TỰ ***

        console.log("Sequential removal process finished.");
        console.log("Successful removals:", successfullyRemovedCount);
        console.log("Failed removals:", songsFailedToRemove.length);


        // Sau khi hoàn thành toàn bộ vòng lặp (dù có lỗi hay không trong quá trình lặp)
        if (successfullyRemovedCount > 0) {
             // Hiển thị thông báo thành công tổng kết số lượng bài xóa được
             toast.success(`${successfullyRemovedCount} song(s) removed from "${album.title}"`);
             // Gọi callback để dashboard refresh dữ liệu, chỉ khi có ít nhất 1 bài được xóa thành công
             if (onSongsChanged) {
                 onSongsChanged();
             }
        } else if (songsFailedToRemove.length === songsToRemove.length) {
            // Nếu TẤT CẢ các bài hát đều xóa lỗi
             toast.error('Failed to remove all selected songs.');
        } else if (songsFailedToRemove.length > 0) {
            // Nếu có VÀI bài xóa lỗi, vài bài xóa thành công
            const failedIds = songsFailedToRemove.map(item => item.songId).join(', ');
            toast.warning(`Successfully removed ${successfullyRemovedCount} song(s), but failed to remove ${songsFailedToRemove.length} song(s).`);
            console.error('Details of failed removals:', songsFailedToRemove);
        } else {
            // Trường hợp không có bài nào để xóa (songsToRemove.length === 0),
            // điều này đã được xử lý ở đầu hàm, nhưng thêm case này cho đầy đủ.
            // Hoặc trường hợp hiếm là loop chạy nhưng không có bài nào thực sự cần xóa (ví dụ: đã bị xóa bởi người khác)
            toast.info('No songs were removed.');
        }


        // Quyết định có đóng modal sau khi hoàn tất loop hay không
        // Thường thì sẽ đóng modal dù thành công hay thất bại một phần.
        onClose();


    } catch (overallError) {
        // Cái này chỉ bắt các lỗi NẰM NGOÀI vòng lặp (ví dụ: lỗi khi truy cập album ban đầu)
        console.error('An unexpected error occurred during the overall song removal process:', overallError);
        toast.error('An unexpected error occurred during removal process.');
        onClose(); // Đóng modal khi có lỗi tổng quát
    }
};

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Remove Songs from "{album?.title}"</h2>
                    <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {/* Kiểm tra album và album.songs trước khi map */}
                {album?.songs && Array.isArray(album.songs) && album.songs.length > 0 ? (
                    <div className="mb-4">
                        <h6 className="text-gray-300 mb-2">Select songs to remove:</h6>
                        <ul className="space-y-2">
                            {/* Kiểm tra object song có hợp lệ không trước khi truy cập thuộc tính */}
                            {album.songs.map(song => song && song._id ? (
                                <li key={song._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`remove-song-${song._id}`}
                                        value={song._id}
                                        onChange={() => handleRemoveCheckboxChange(song._id)}
                                        checked={songsToRemove.includes(song._id)} // Giữ trạng thái checkbox
                                        className="cursor-pointer mr-2 form-checkbox rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
                                    />
                                    {/* Truy cập thuộc tính song một cách an toàn */}
                                    <label htmlFor={`remove-song-${song._id}`} className="text-white cursor-pointer">{song.title || 'Unknown Title'} - {song.artist || 'Unknown Artist'}</label>
                                </li>
                            ) : null // Bỏ qua nếu object song không hợp lệ
                            )}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No songs in this album.</p>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                        Cancel
                    </button>
                    <button
                        onClick={handleRemoveSongsFromAlbum}
                        className={`bg-red-600 cursor-pointer hover:bg-red-700 text-white py-2 px-4 rounded-md focus:outline-none ${songsToRemove.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={songsToRemove.length === 0} // Disable nút nếu không chọn bài hát nào
                    >
                         Remove {songsToRemove.length > 0 ? `(${songsToRemove.length})` : ''} Song(s)
                    </button>
                </div>
            </div>
             {/* CSS cho custom scrollbar */}
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

export default ChangeAlbumModal;