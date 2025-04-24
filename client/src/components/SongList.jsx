import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { FaPlay } from 'react-icons/fa';

const SongList = () => {
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
            <button
                onClick={() => scroll('left')}
                className="cursor-pointer absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-500 hover:scale-110 hover:shadow-2xl"
            >
                ◀
            </button>


            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar"
            >
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[220px] bg-gray-800 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group"
                        onClick={() => handleSongSelect(song)}
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
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className=" cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-500 hover:scale-110 hover:shadow-2xl"
            >
                ▶
            </button>

        </div>
    );
};

export default SongList;
