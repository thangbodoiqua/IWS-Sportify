import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { FaPlay, FaPlus } from 'react-icons/fa'; // Import FaPlus icon

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
        const scrollAmount = 160 + 16; // Kích thước item + gap
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
        <div className="relative p-6 h-[240px] w-full max-w-[calc(100vw - 48px)] md:w-[620px]"> {/* Tăng chiều rộng một chút để vừa nút cuộn */}
            <button
                onClick={() => scroll('left')}
                className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105"
                aria-label="Scroll left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }} // Cho iOS cuộn mượt mà
            >
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group transition-all duration-200 hover:shadow-xl"
                        onClick={() => handleSongSelect(song)}
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
                            {/* Add to Playlist Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngăn sự kiện click lan ra div cha (chọn bài hát)
                                    if (onOpenPlaylistModal) {
                                        onOpenPlaylistModal(song);
                                    }
                                }}
                                className="absolute top-2 right-2 bg-gray-700 bg-opacity-70 rounded-full p-1 text-white hover:bg-gray-600 focus:outline-none"
                                aria-label={`Add ${song.title} to playlist`}
                            >
                                <FaPlus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-3 flex flex-col">
                            <h3 className="text-sm font-semibold text-white truncate">{song.title}</h3>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105"
                aria-label="Scroll right"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            {/* Ẩn thanh cuộn ngang */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default SongList;