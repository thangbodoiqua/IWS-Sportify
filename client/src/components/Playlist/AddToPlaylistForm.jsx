import React from 'react';
import { X } from 'lucide-react';

const AddToPlaylistForm = ({ song, onClose, playlists, onAddToPlaylist }) => {
    const handleAddToPlaylistClick = (playlistId) => {
        if (song) {
            onAddToPlaylist(playlistId, song._id);
            onClose();
        }
    };

    const availablePlaylists = playlists ? playlists.filter(playlist => {
        if (playlist.songs && Array.isArray(playlist.songs)) {
            return !playlist.songs.some(existingSong => existingSong._id === song?._id);
        }
        if (playlist.songIds && Array.isArray(playlist.songIds)) {
            return !playlist.songIds.includes(song?._id);
        }
        return true;
    }) : [];

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-md shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-semibold">Add to Playlist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {availablePlaylists.length > 0 ? (
                    <ul>
                        {availablePlaylists.map(playlist => (
                            <li key={playlist._id} className="py-2 border-b border-gray-800 last:border-b-0">
                                <button
                                    onClick={() => handleAddToPlaylistClick(playlist._id)}
                                    className="text-white hover:text-green-500 focus:outline-none w-full text-left"
                                >
                                    {playlist.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No playlists available to add this song to.</p>
                )}
            </div>
        </div>
    );
};

export default AddToPlaylistForm;