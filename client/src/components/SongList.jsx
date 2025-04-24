import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { FaPlay, FaPlus } from 'react-icons/fa'; // Import icon

const SongList = ({ onOpenPlaylistModal }) => {
    const { value } = useContext(AppContext);
    const { backendUrl, setCurrentSong } = value;
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const res = await (await fetch(`${backendUrl}/api/song/`)).json();
                setSongs(res);
            } catch (err) {
                console.error('Failed to fetch songs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSongs();
    }, [backendUrl]);

    const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = 180 * 2;
        if (container) {
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleSongSelect = (song) => {
        setCurrentSong(song);
    };

    return loading ? (
        <div className="flex items-center justify-center p-10 text-white">Loading songs...</div>
    ) : (
        <div className="relative p-6 h-[260px] w-[600px]">
            {/* ... (hai nút scroll giữ nguyên) */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
            >
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[220px] bg-gray-800 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group"
                    >
                        <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="w-full h-[120px] object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FaPlay className="text-white text-xl" />
                        </div>
                        <div className="p-3 flex flex-col">
                            <h3 className="text-sm font-semibold text-white truncate">{song.title}</h3>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                        </div>
                        <button
                            onClick={() => onOpenPlaylistModal(song)} // Sử dụng hàm từ props
                            className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
                        >
                            <FaPlus className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
            {/* ... (nút scroll phải giữ nguyên) */}
        </div>
    );
};

export default SongList;