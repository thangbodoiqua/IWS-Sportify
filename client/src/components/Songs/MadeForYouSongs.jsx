import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaPlay } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import SongOptions from './SongOptions'; // Import component SongOptions

const MadeForYouSongs = ({ onOpenPlaylistModal }) => {
    const { value } = useContext(AppContext);
    const { backendUrl, setCurrentSong, addToQueue } = value;
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [optionsVisible, setOptionsVisible] = useState(null); // Chỉ lưu ID bài hát có options đang hiển thị

    useEffect(() => {
        const fetchMadeForYouSongs = async () => {
            try {
                const res = await (await fetch(`${backendUrl}/api/song/made-for-you`)).json();
                setSongs(res);
            } catch (err) {
                console.error('Failed to fetch "Made For You" songs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMadeForYouSongs();
    }, [backendUrl]);

    const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = 160 + 16;
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

    const handleAddToQueue = (song) => {
        if (addToQueue) {
            addToQueue(song);
            console.log(`Đã thêm ${song.title} vào queue`);
        } else {
            console.warn('Hàm addToQueue không được định nghĩa trong AppContext');
        }
    };

    const toggleOptions = (e, songId) => {
        e.stopPropagation();
        setOptionsVisible(optionsVisible === songId ? null : songId); // Đóng nếu đang mở, mở nếu đang đóng
    };

    const closeOptions = () => {
        setOptionsVisible(null);
    };

    return loading ? (
        <div className="flex items-center justify-center p-3 text-white">Loading "Made For You" songs...</div>
    ) : (
        <div className="relative p-3 h-[240px] w-full max-w-[calc(100vw - 48px)] md:w-[850px]">
            <h2 className="text-xl font-semibold text-white mb-2">Made For You</h2>
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
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group transition-all duration-200 hover:shadow-xl flex flex-col"
                        onClick={() => handleSongSelect(song)}
                    >
                        <div className="relative w-full h-[115px] overflow-hidden rounded-t-xl">
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
                            {/* Nút dấu ba chấm và SongOptions */}
                            <div className=" absolute top-2 right-2 z-10">
                                <button
                                    onClick={(e) => toggleOptions(e, song._id)}
                                    className="cursor-pointer bg-gray-700 bg-opacity-70 rounded-full p-1 text-white hover:bg-gray-600 focus:outline-none"
                                    aria-label={`More options for ${song.title}`}
                                >
                                    <FiMoreVertical className="w-4 h-4" />
                                </button>
                                {optionsVisible === song._id && (
                                    <SongOptions
                                        song={song}
                                        onClose={closeOptions}
                                        onAddToQueue={handleAddToQueue}
                                        onOpenPlaylistModal={onOpenPlaylistModal}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
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

export default MadeForYouSongs;