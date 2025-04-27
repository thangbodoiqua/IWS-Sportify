import React, { useState } from 'react';
import { Trash2, Music2 } from 'lucide-react';
import axiosInstance from '../../AxiosInstance';
import { toast } from 'react-toastify';
import ChangeAlbumModal from './ChangeAlbumModal'; // Import ChangeAlbumModal

const AlbumTable = ({ albums, allSongs, onAlbumDeleted, onAlbumUpdated }) => {
    const [showConfirmationDeleteAlbum, setShowConfirmationDeleteAlbum] = useState(false);
    const [albumToDeleteId, setAlbumToDeleteId] = useState(null);
    const [showChangeSongsModal, setShowChangeSongsModal] = useState(false);
    const [currentAlbum, setCurrentAlbum] = useState(null);

    const handleDeleteClick = (albumId) => {
        setAlbumToDeleteId(albumId);
        setShowConfirmationDeleteAlbum(true);
    };

    const confirmDeleteAlbum = async () => {
        if (albumToDeleteId) {
            try {
                await axiosInstance.delete(`/api/album/${albumToDeleteId}`);
                toast.success(`Album deleted successfully`);
                if (onAlbumDeleted) {
                    onAlbumDeleted(albumToDeleteId);
                }
            } catch (error) {
                console.error('Error deleting album:', error);
                toast.error('Error deleting album');
            } finally {
                setShowConfirmationDeleteAlbum(false);
                setAlbumToDeleteId(null);
            }
        }
    };

    const cancelDeleteAlbum = () => {
        setShowConfirmationDeleteAlbum(false);
        setAlbumToDeleteId(null);
    };

    const handleChangeSongsClick = (album) => {
        setCurrentAlbum(album);
        setShowChangeSongsModal(true);
    };

    const handleCloseChangeSongsModal = () => {
        setCurrentAlbum(null);
        setShowChangeSongsModal(false);
    };

    const handleSongsChanged = () => {
        if (onAlbumUpdated && currentAlbum) {
            onAlbumUpdated(currentAlbum._id); // Gọi callback để thông báo album đã được cập nhật
        }
        handleCloseChangeSongsModal();
    };

    return (
        <div className="bg-[#1a1a1a] rounded-md p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-2">📚 Albums Library</h4>
            <p className="text-gray-400 mb-4">Manage your album collection</p>

            <table className="w-full text-left text-white text-sm">
                <thead>
                    <tr className="text-gray-400 border-b border-gray-600">
                        <th className="py-2">Title</th>
                        <th>Description</th>
                        <th>Songs</th>
                        <th>Remove Song</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {albums.map((album) => (
                        <tr key={album._id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                            <td className="py-2">{album.title}</td>
                            <td>{album.description || 'Unknown'}</td>
                            
                            <td>{album.songs?.length || 0}</td>
                            <td>
                            <button
                                    onClick={() => handleChangeSongsClick(album)}
                                    className="cursor-pointer text-yellow-500 hover:text-yellow-400 focus:outline-none"
                                    title="Change Songs"
                                >
                                    Remove Songs
                                </button>
                            </td>
                            <td className="text-right flex justify-end gap-2">
                                
                                <button
                                    onClick={() => handleDeleteClick(album._id)}
                                    className="text-red-500 cursor-pointer hover:text-red-400 focus:outline-none"
                                    title="Delete Album"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Confirmation Delete Album Popup */}
            {showConfirmationDeleteAlbum && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-[#222] rounded-md p-6">
                        <h5 className="text-lg font-semibold text-white mb-4">Confirm Delete Album</h5>
                        <p className="text-gray-400 mb-4">Are you sure you want to delete this album?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={cancelDeleteAlbum} className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none">
                                Cancel
                            </button>
                            <button onClick={confirmDeleteAlbum} className="bg-red-600 cursor-pointer hover:bg-red-500 text-white py-2 px-4 rounded-md focus:outline-none">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Songs Modal */}
            {showChangeSongsModal && currentAlbum && (
                <ChangeAlbumModal
                    album={currentAlbum}
                    allSongs={allSongs}
                    onClose={handleCloseChangeSongsModal}
                    onSongsChanged={handleSongsChanged}
                />
            )}
        </div>
    );
};

export default AlbumTable;