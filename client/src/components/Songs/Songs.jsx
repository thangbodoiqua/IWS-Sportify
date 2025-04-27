import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaPlay, FaPlus, FaListUl, FaEllipsisV } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';

const Song = ({ song, onOpenPlaylistModal }) => {
    const { value } = useContext(AppContext);
    const { setCurrentSong, addToQueue } = value;
    const [optionsVisible, setOptionsVisible] = useState(false);

    const handleSongSelect = () => {
        setCurrentSong(song);
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        if (addToQueue) {
            addToQueue(song);
            console.log(`Đã thêm ${song.title} vào queue`);
        } else {
            console.warn('Eror in Add To Queue');
        }
    };

    const toggleOptions = (e) => {
        e.stopPropagation();
        setOptionsVisible(!optionsVisible);
    };

    return (
        <div
            key={song._id}
            className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group transition-all duration-200 hover:shadow-xl flex flex-col"
            onClick={handleSongSelect}
        >
            <div className="relative w-full h-[100px] overflow-hidden rounded-t-xl">
                <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                    <div className="bg-green-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <FaPlay className="text-black text-lg" />
                    </div>
                </div>
                {/* Nút dấu ba chấm */}
                <button
                    onClick={toggleOptions}
                    className="absolute top-2 right-2 bg-gray-700 bg-opacity-70 rounded-full p-1 text-white hover:bg-gray-600 focus:outline-none z-10"
                    aria-label={`More options for ${song.title}`}
                >
                    <FiMoreVertical className="w-4 h-4" />
                </button>
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-sm font-semibold text-white truncate">{song.title}</h3>
                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>
            {/* Các options (ẩn hiện dựa trên state) */}
            {optionsVisible && (
                <div className="flex flex-col items-center justify-around p-2 bg-gray-800 rounded-b-xl">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenPlaylistModal) {
                                onOpenPlaylistModal(song);
                            }
                        }}
                        className="w-full py-2 text-sm text-white hover:bg-gray-700 rounded"
                        aria-label={`Add ${song.title} to playlist`}
                    >
                        Add to Playlist
                    </button>
                    <button
                        onClick={handleAddToQueue}
                        className="w-full py-2 text-sm text-white hover:bg-gray-700 rounded"
                        aria-label={`Add ${song.title} to queue`}
                    >
                        Add to Queue
                    </button>
                    {/* Bạn có thể thêm các tùy chọn khác ở đây */}
                </div>
            )}
        </div>
    );
};

export default Song;