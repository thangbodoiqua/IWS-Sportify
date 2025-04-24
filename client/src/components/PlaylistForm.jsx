import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import axiosInstance from '../AxiosInstance';
import { XCircle } from 'lucide-react'; // Import icon

const PlaylistForm = ({ onCancel, onPlaylistCreated }) => {
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const { value } = useContext(AppContext);
    const { isLoggedIn } = value;


    const handleCreatePlaylist = async () => {
        if (!isLoggedIn) {
            toast.error("Please log in to create a playlist.");
            return;
        }

        if (!playlistName.trim()) {
            toast.error("Playlist name is required.");
            return;
        }

        try {
            const response = await axiosInstance.post('/api/playlist/create-playlist', {
                name: playlistName,
                description: playlistDescription,
            });
            toast.success(response.data.message);
            onPlaylistCreated(response.data.playlist); // Gọi callback để thông báo cho SideBar
            setPlaylistName('');
            setPlaylistDescription('');

        } catch (error) {
            const message = error.response?.data?.message || "Failed to create playlist";
            toast.error(message);
            console.error('Error creating playlist:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"> {/* Overlay */}
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700">  {/* Modal container */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-white">Create New Playlist</h1>
                    <button onClick={onCancel} className="cursor-pointer text-gray-400 hover:text-white transition-colors">
                         <XCircle className="h-6 w-6" /> {/* Close icon */}
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Playlist Name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full px-4 py-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                    placeholder="Description (Optional)"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"

                />
                <div className="flex gap-4">
                    <button
                        onClick={handleCreatePlaylist}
                        className="cursor-pointer px-6 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    >
                        Create
                    </button>
                    <button
                        onClick={onCancel}
                        className="cursor-pointer px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistForm;
