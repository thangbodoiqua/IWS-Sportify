import React, { useEffect, useRef } from 'react';
import { FaPlus, FaListUl } from 'react-icons/fa';

const SongOptions = ({ song, onClose, onAddToQueue, onOpenPlaylistModal }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={dropdownRef} className=" absolute top-6 right-0 bg-gray-800 rounded-md shadow-md z-50 w-35">
            <button
                onClick={() => {
                    onAddToQueue(song);
                    onClose();
                }}
                className="cursor-pointer block w-full py-2 px-2 text-sm text-white hover:bg-gray-700 focus:outline-none"
            >
                <FaPlus className="inline-block mr-2" /> Add to Queue
            </button>
            <button
                onClick={() => {
                    onOpenPlaylistModal(song);
                    onClose();
                }}
                className="cursor-pointer block w-full py-2 px-2 text-sm text-white hover:bg-gray-700 focus:outline-none"
            >
                <FaListUl className="inline-block mr-2" /> Add to Playlist
            </button>
            {/* Bạn có thể thêm các options khác ở đây */}
        </div>
    );
};

export default SongOptions;