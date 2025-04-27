import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';

const ChangeAlbumModal = ({ album, onClose, onSongsChanged }) => {
    const [songsToRemove, setSongsToRemove] = useState([]);
    console.log(album)
    const handleRemoveCheckboxChange = (songId) => {
        setSongsToRemove(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            } else {
                return [...prev, songId];
            }
        });
    };

    const handleRemoveSongsFromAlbum = async () => {
        if (album && songsToRemove.length > 0) {
            try {
                const results = await Promise.all(
                    songsToRemove.map(songId =>
                        axiosInstance.post('/api/album/remove-song', {
                            albumId: album._id,
                            songId: songId,
                        })
                    )
                );
                toast.success(`${songsToRemove.length} song(s) removed from "${album.title}"`);
                if (onSongsChanged) {
                    onSongsChanged(); // Gọi callback để thông báo thay đổi
                }
                onClose();
            } catch (error) {
                console.error('Error removing songs from album:', error);
                toast.error('Error removing songs from album');
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Remove Songs from "{album?.title}"</h2>
                    <button onClick={onClose} className="cursor-pointer  text-gray-400 hover:text-white transition-colors">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {album?.songs && album.songs.length > 0 ? (
                    <div className="mb-4">
                        <h6 className="text-gray-300 mb-2">Select songs to remove:</h6>
                        <ul className="space-y-2">
                            {album.songs.map(song => (
                                <li key={song._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`remove-song-${song._id}`}
                                        value={song._id}
                                        onChange={() => handleRemoveCheckboxChange(song._id)}
                                        className="cursor-pointer  mr-2 form-checkbox rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
                                    />
                                    <label htmlFor={`remove-song-${song._id}`} className="text-white">{song.title} - {song.artist}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400">No songs in this album.</p>
                )}

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="cursor-pointer  bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                        Cancel
                    </button>
                    <button
                        onClick={handleRemoveSongsFromAlbum}
                        className="bg-red-600 cursor-pointer  hover:bg-red-700 text-white py-2 px-4 rounded-md focus:outline-none"
                        disabled={songsToRemove.length === 0}
                    >
                        Remove Songs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeAlbumModal;