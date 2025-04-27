import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { FaPlay } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
// Removed unused import: useNavigate
import axiosInstance from '../../AxiosInstance';
import { assets } from '../../assets/resources/assets';

const AlbumList = ({ onAlbumSelect }) => {
    const { value } = useContext(AppContext);
    const { backendUrl } = value;
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed unused state: navigate
    const scrollRef = useRef(null);

    // New state for scrollability and hover
    const [isHoveringContainer, setIsHoveringContainer] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Fetching Data
    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`${backendUrl}/api/album/`);
                if (response.data.success) {
                    // console.log("Fetched albums:", response.data.albums); // Keep or remove console log
                    setAlbums(response.data.albums);
                } else {
                    console.error("Failed to fetch albums:", response.data.message);
                    setAlbums([]); // Ensure albums is an array even on failure
                }
            } catch (error) {
                console.error("Error fetching albums:", error);
                 setAlbums([]); // Ensure albums is an array on error
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [backendUrl]); // Dependency on backendUrl for fetching

    // Scrollability Check Logic
    const checkScrollability = useCallback(() => {
        const container = scrollRef.current;
        if (container) {
             // Allow a small tolerance for floating point inaccuracies
            const tolerance = 1;
            const hasHorizontalScrollbar = container.scrollWidth > container.clientWidth + tolerance;

            setCanScrollLeft(hasHorizontalScrollbar && container.scrollLeft > tolerance);
            setCanScrollRight(hasHorizontalScrollbar && container.scrollLeft < container.scrollWidth - container.clientWidth - tolerance);

             // Ensure buttons are hidden if there's no scrollbar at all
             if (!hasHorizontalScrollbar) {
                setCanScrollLeft(false);
                setCanScrollRight(false);
             }

        } else {
            setCanScrollLeft(false);
            setCanScrollRight(false);
        }
    }, []); // No dependencies needed inside useCallback itself

    // Effect to handle scroll listeners, resize observer, and initial check
    useEffect(() => {
        const container = scrollRef.current;
        // Only set up listeners if data is loaded and there's a container
        if (container && !loading) {
            // Initial check
            checkScrollability();

            // Add scroll listener
            const handleScroll = () => checkScrollability();
            container.addEventListener('scroll', handleScroll, { passive: true });

            // Add resize observer
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(container);

            // Add a small delay check just in case rendering takes a moment
            const timerId = setTimeout(checkScrollability, 50);

            // Cleanup function
            return () => {
                 if (container) { // Ensure container is still valid on cleanup
                    container.removeEventListener('scroll', handleScroll);
                    resizeObserver.unobserve(container);
                 }
                 clearTimeout(timerId);
            };
        } else {
             // If loading or no container, ensure buttons are hidden
             setCanScrollLeft(false);
             setCanScrollRight(false);
        }
        // Re-run this effect if loading state changes, album count changes, or checkScrollability function itself changes (though it's memoized with [])
    }, [loading, albums.length, checkScrollability]);


    // Scroll Function (updated to scroll by half container width)
    const scroll = (direction) => {
        const container = scrollRef.current;
         // Scroll by approximately half the container width
        const scrollAmount = container ? (container.clientWidth / 2) : 300; // Fallback value
        if (container) {
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
             // Check scrollability again after scrolling finishes (approximate time)
            setTimeout(checkScrollability, 350); // Adjust the timeout if needed
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-3 text-white h-[240px]">Loading albums...</div>;
    }

    if (albums.length === 0) {
        return <div className="flex items-center justify-center p-3 text-white h-[240px]">No albums found.</div>;
    }

    return (
        <div
            className="relative p-3 h-[240px] w-full max-w-[calc(100vw - 48px)] md:max-w-[850px] mx-auto" // Add mx-auto for centering
            onMouseEnter={() => setIsHoveringContainer(true)}
            onMouseLeave={() => setIsHoveringContainer(false)}
        >

            {/* Scroll Left Button - Conditionally rendered */}
            {isHoveringContainer && canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    // Adjusted positioning and styling to match MadeForYouSongs
                    className="cursor-pointer absolute left-[-8px] md:left-[-15px] top-1/2 transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100"
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}

            <div
                ref={scrollRef}
                // Added pb-2 for consistency and potential scrollbar space
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {albums.map((album) => (
                    <div
                        key={album._id}
                        // Updated background hover color to match MadeForYouSongs pattern
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-[#181818] hover:bg-[#282828] rounded-lg overflow-hidden shadow-lg flex-shrink-0 relative group transition-colors duration-200 flex flex-col"
                        onClick={() => onAlbumSelect(album)}
                    >
                        <div className="relative w-full h-[115px] overflow-hidden rounded-t-lg"> {/* Adjusted height slightly for consistency */}
                            <img
                                src={album.coverUrl || assets.soundIMG}
                                alt={album.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Updated transition duration
                            />
                             {/* Play Button - Updated positioning and styling slightly */}
                            <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAlbumSelect(album); }} // Stop propagation so it doesn't trigger the main div click
                                    className="bg-green-500 hover:bg-green-400 rounded-full p-3 shadow-lg focus:outline-none"
                                    aria-label={`Play album ${album.title}`}
                                >
                                    <FaPlay className="text-black text-sm" /> {/* Adjusted icon size */}
                                </button>
                            </div>
                        </div>
                         {/* Album Info - Ensure truncation classes are correct */}
                        <div className="p-3 flex flex-col flex-grow overflow-hidden">
                            <h3 className="text-sm font-semibold text-white truncate whitespace-nowrap" title={album.title}>
                                {album.title}
                            </h3>
                            <p className="text-xs text-gray-400 truncate whitespace-nowrap" title={album.description}>
                                {album.description}
                            </p>
                        </div>
                    </div>
                ))}
                <div className="min-w-[1px] flex-shrink-0"></div> {/* Add Spacer */}
            </div>

            {/* Scroll Right Button - Conditionally rendered */}
            {isHoveringContainer && canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                     // Adjusted positioning and styling to match MadeForYouSongs
                    className="cursor-pointer absolute right-[-8px] md:right-[-15px] top-1/2 transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100"
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

export default AlbumList;