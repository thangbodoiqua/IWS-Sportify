import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X } from 'lucide-react';

const Playlist = ({ song, onClose: onClosePlaylist }) => { // Đổi tên prop onClose
    const { value } = useContext(AppContext);
    const { filterPlaylistsContainingSong, addSongToPlaylist } = value;

    const filteredPlaylists = filterPlaylistsContainingSong(song);

    const handleAddToPlaylist = (playlistId) => {
        if (song) {
            addSongToPlaylist(playlistId, song._id);
            onClosePlaylist(); // Sử dụng tên prop mới
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-md shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-semibold">Add to Playlist</h2>
                    <button onClick={onClosePlaylist} className="text-gray-400 hover:text-white focus:outline-none"> {/* Sử dụng tên prop mới */}
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {filteredPlaylists.length > 0 ? (
                    <ul>
                        {filteredPlaylists.map(playlist => (
                            <li key={playlist._id} className="py-2 border-b border-gray-800 last:border-b-0">
                                <button
                                    onClick={() => handleAddToPlaylist(playlist._id)}
                                    className="text-white hover:text-green-500 focus:outline-none w-full text-left"
                                >
                                    {playlist.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No playlists available to add this song.</p>
                )}
            </div>
        </div>
    );
};

export default Playlist;