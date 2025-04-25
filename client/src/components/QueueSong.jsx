import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FaTrash } from 'react-icons/fa';

const QueueSong = ({ onClose }) => {
    const { value } = useContext(AppContext);
    const { queue, currentSong, removeFromQueue, playFromQueue } = value;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-6 rounded-md shadow-lg z-50 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Queue</h2>
            {queue.length > 0 ? (
                <ul>
                    {queue.map((song, index) => (
                        <li
                            key={song._id}
                            className={`flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0 cursor-pointer ${currentSong?._id === song._id ? 'text-green-500' : 'hover:text-gray-300'}`}
                            onClick={() => playFromQueue(index)}
                        >
                            <div className="flex items-center">
                                <img src={song.imageUrl} alt={song.title} className="w-8 h-8 rounded mr-2" />
                                <div>
                                    <p className="text-sm font-semibold">{song.title}</p>
                                    <p className="text-xs text-gray-400">{song.artist}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent playing the song when removing
                                    removeFromQueue(index);
                                }}
                                className="text-red-500 hover:text-red-400 focus:outline-none"
                                aria-label={`Remove ${song.title} from queue`}
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Queue is empty.</p>
            )}
            <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mt-4 focus:outline-none">
                Close Queue
            </button>
        </div>
    );
};

export default QueueSong;