import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'; // Thêm useCallback
import { AppContext } from '../../context/AppContext';
import { FaPlay } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import SongOptions from './SongOptions';

const TrendingSong = ({ onOpenPlaylistModal }) => {
    const { value } = useContext(AppContext);
    const { backendUrl, setCurrentSong, addToQueue, setIsPlaying } = value;
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [optionsVisible, setOptionsVisible] = useState(null);
    const [isHoveringContainer, setIsHoveringContainer] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [hoveredSongId, setHoveredSongId] = useState(null);

     // Fetching Data
    useEffect(() => {
        const fetchTrendingSongs = async () => {
             setLoading(true);
            try {
                const res = await fetch(`${backendUrl}/api/song/trending`);
                 if (!res.ok) {
                   throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setSongs(data || []);
            } catch (err) {
                console.error('Failed to fetch trending songs:', err);
                 setSongs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTrendingSongs();
    }, [backendUrl]);

     // Scrollability Check Logic
    const checkScrollability = useCallback(() => {
        const container = scrollRef.current;
        if (container) {
             const hasHorizontalScrollbar = container.scrollWidth > container.clientWidth;
            const tolerance = 1;
            setCanScrollLeft(container.scrollLeft > tolerance);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - tolerance);
             if (!hasHorizontalScrollbar) {
                 setCanScrollLeft(false);
                 setCanScrollRight(false);
            }
        } else {
            setCanScrollLeft(false);
            setCanScrollRight(false);
        }
    }, []);

    // Effect to handle scroll listeners and initial check
    useEffect(() => {
        const container = scrollRef.current;
        if (container && !loading) {
            container.addEventListener('scroll', checkScrollability, { passive: true });
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(container);
            const timerId = setTimeout(checkScrollability, 50);

            return () => {
                container.removeEventListener('scroll', checkScrollability);
                resizeObserver.unobserve(container);
                clearTimeout(timerId);
            };
        } else {
             setCanScrollLeft(false);
             setCanScrollRight(false);
        }
    }, [loading, checkScrollability, songs]); // Thêm songs dependency

    // Scroll Function
     const scroll = (direction) => {
        const container = scrollRef.current;
        const scrollAmount = container ? (container.clientWidth / 2) : 300;
        if (container) {
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
             setTimeout(checkScrollability, 350);
        }
    };

    // Handlers
    const handleSongSelect = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const handleAddToQueue = (song) => {
        if (addToQueue) {
            addToQueue(song);
        } else {
             console.warn('addToQueue function is not available in AppContext');
        }
    };

     const toggleOptions = (e, songId) => {
        e.stopPropagation();
        setOptionsVisible(optionsVisible === songId ? null : songId);
    };

    const closeOptions = () => {
        setOptionsVisible(null);
    };

     const handleMouseEnterContainer = () => {
        setIsHoveringContainer(true);
        checkScrollability();
    }

    // JSX Rendering
    return loading ? (
        <div className="flex items-center justify-center p-3 text-white h-[240px]">Loading trending songs...</div>
    ) : (
         <div
            className="relative p-3 h-[240px] w-full max-w-[calc(100vw - 48px)] md:max-w-[850px] mx-auto"
            onMouseEnter={handleMouseEnterContainer}
            onMouseLeave={() => setIsHoveringContainer(false)}
        >
            <h2 className="text-xl font-semibold text-white mb-2">Trending Songs</h2>

             {/* Scroll Left Button */}
             {isHoveringContainer && canScrollLeft && (
                 <button
                    onClick={() => scroll('left')}
                    className="cursor-pointer absolute left-[-8px] md:left-[-15px] top-[calc(50%_+_10px)] transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100"
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}

            {/* Song List Container */}
             <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {songs.map((song) => (
                     <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-[#181818] hover:bg-[#282828] rounded-lg overflow-hidden shadow-lg flex-shrink-0 relative group transition-colors duration-200 flex flex-col"
                        onClick={() => handleSongSelect(song)}
                        onMouseEnter={() => setHoveredSongId(song._id)}
                        onMouseLeave={() => setHoveredSongId(null)}
                    >
                        {/* Image and Play Button */}
                        <div className="relative w-full h-[115px] overflow-hidden rounded-t-lg">
                             <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSongSelect(song); }}
                                    className="bg-green-500 hover:bg-green-400 rounded-full p-3 shadow-lg focus:outline-none"
                                    aria-label={`Play ${song.title}`}
                                >
                                    <FaPlay className="text-black text-sm" />
                                </button>
                            </div>
                             {/* More Options Button & Menu */}
                             {hoveredSongId === song._id && (
                                <div className="absolute top-2 right-2 z-20">
                                    <button
                                        onClick={(e) => toggleOptions(e, song._id)}
                                        className="cursor-pointer bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-1 text-white focus:outline-none transition-opacity"
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
                            )}
                        </div>
                         {/* Song Info */}
                        <div className="p-3 flex flex-col flex-grow overflow-hidden">
                            <h3 className="text-sm font-semibold text-white truncate whitespace-nowrap">{song.title}</h3>
                            <p className="text-xs text-gray-400 truncate whitespace-nowrap">{song.artist}</p>
                        </div>
                    </div>
                ))}
                 <div className="min-w-[1px] flex-shrink-0"></div> {/* Spacer */}
            </div>

            {/* Scroll Right Button */}
            {isHoveringContainer && canScrollRight && (
                 <button
                    onClick={() => scroll('right')}
                     className="cursor-pointer absolute right-[-8px] md:right-[-15px] top-[calc(50%_+_10px)] transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100"
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}

             {/* No Scrollbar Style */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TrendingSong;