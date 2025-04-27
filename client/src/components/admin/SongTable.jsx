import { useState } from 'react';
import { Trash2, PlusCircle } from 'lucide-react'; // Import PlusCircle icon
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';

const SongTable = ({ songs, onSongDeleted, onAddToAlbum }) => { // Nhận callback onAddToAlbum
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [songToDeleteId, setSongToDeleteId] = useState(null);

    const handleDeleteClick = (songId) => {
        setSongToDeleteId(songId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (songToDeleteId) {
            try {
                await axiosInstance.delete(`/api/song/${songToDeleteId}`);
                toast.success(`Deleted successfully`);
                if (onSongDeleted) {
                    onSongDeleted(songToDeleteId);
                }
            } catch (error) {
                console.error('Error deleting song:', error);
            } finally {
                setShowConfirmation(false);
                setSongToDeleteId(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowConfirmation(false);
        setSongToDeleteId(null);
    };

    const handleAddToAlbumClick = (song) => {
        if (onAddToAlbum) {
            onAddToAlbum(song); // Gọi callback và truyền thông tin bài hát
        }
    };

    return (
        <div className="bg-[#1a1a1a] rounded-md p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-2">🎵 Songs Library</h4>
            <table className="w-full text-left text-white text-sm">
                <thead>
                    <tr className="text-gray-400 border-b border-gray-600">
                        <th className="py-2">Title</th>
                        <th>Artist</th>
                        <th>Album</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song) => (
                        <tr key={song._id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                            <td className="py-2">{song.title}</td>
                            <td>{song.artist}</td>
                            <td><button
                                    onClick={() => handleAddToAlbumClick(song)}
                                    className="text-blue-500 cursor-pointer hover:text-blue-400 focus:outline-none"
                                    title="Add to Album"
                                > Add to Album
                                </button></td>
                            <td className="text-right flex justify-end gap-2">
                                
                                <button
                                    onClick={() => handleDeleteClick(song._id)}
                                    className="text-red-500 cursor-pointer hover:text-red-400 focus:outline-none"
                                    title="Delete Song"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#222] rounded-md p-6">
                        <h5 className="text-lg font-semibold text-white mb-4">Confirm Delete</h5>
                        <p className="text-gray-400 mb-4">Are you sure you want to delete this song?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={cancelDelete} className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="bg-red-600 cursor-pointer hover:bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SongTable;