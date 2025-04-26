import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaPlay } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../AxiosInstance';
import { assets } from '../../assets/resources/assets'; // Assuming you might need assets

const AlbumList = ({ onAlbumSelect }) => {
    const { value } = useContext(AppContext);
    const { backendUrl } = value;
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`${backendUrl}/api/album/`);
                if (response.data.success) {
                    console.log("Fetched albums:", response.data.albums);
                    setAlbums(response.data.albums);
                } else {
                    console.error("Failed to fetch albums:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching albums:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
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

    if (loading) {
        return <div className="p-4 text-white">Loading albums...</div>;
    }

    if (albums.length === 0) {
        return <div className="p-4 text-white">No albums found.</div>;
    }

    return (
        <div className="relative p-3 h-[240px] w-full max-w-[calc(100vw - 48px)] md:w-[850px]">
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
                {albums.map((album) => (
                    <div
                        key={album._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative group transition-all duration-200 hover:shadow-xl flex flex-col"
                        onClick={() => onAlbumSelect(album)}
                    >
                        <div className="relative w-full h-[100px] overflow-hidden rounded-t-xl">
                            <img
                                src={album.coverUrl || assets.soundIMG}
                                alt={album.title}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                                <div className="bg-green-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <FaPlay className="text-black text-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                            <h3 className="text-sm font-semibold text-white truncate" title={album.title}>
                                {album.title}
                            </h3>
                            <p className="text-xs text-gray-400 truncate" title={album.description}>
                                {album.description}
                            </p>
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

export default AlbumList;