import React, { useState, useContext } from 'react';
// import axios from 'axios'; // Sử dụng axiosInstance thay vì axios global
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { XCircle } from 'lucide-react'; // Import icon
import axiosInstance from '../../AxiosInstance'; // Import AxiosInstance

const AddSongForm = ({ onCancel, onSongCreated, albums }) => {
    const { backendUrl } = useContext(AppContext).value;
    const [isUploading, setIsUploading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        artist: '',
        duration: '',
    });
    const [selectedAlbumId, setSelectedAlbumId] = useState(''); // Initialize with empty string
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length === 0) return; // Ensure a file was selected
        const file = files[0];

        // Optional: Add file type/size validation
        // if (name === 'audioFile' && !file.type.startsWith('audio/')) { toast.error('Invalid audio file type'); return; }
        // if (name === 'imageFile' && !file.type.startsWith('image/')) { toast.error('Invalid image file type'); return; }
        // if (file.size > 10 * 1024 * 1024) { toast.error('File size exceeds 10MB'); return; }


        if (name === 'audioFile') setAudioFile(file);
        if (name === 'imageFile') setImageFile(file);
    };
    const handleAlbumSelectChange = (e) => {
        setSelectedAlbumId(e.target.value);
    };


    const clearForm = () => {
        setForm({ title: '', artist: '', duration: '' }); // Remove albumId
        setSelectedAlbumId(''); // Reset selected album ID
        setAudioFile(null);
        setImageFile(null);
        // Reset file input values using IDs if needed
        const audioInput = document.getElementById('audio-file-input');
        if (audioInput) audioInput.value = '';
        const imageInput = document.getElementById('image-file-input');
        if (imageInput) imageInput.value = '';
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.title || !form.artist || !form.duration) {
            toast.error('Please fill in all required fields (Title, Artist, Duration)');
            return;
        }
        if (!audioFile || !imageFile) {
            toast.error('Please upload both audio and image files');
            return;
        }


        setIsUploading(true);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('artist', form.artist);
        formData.append('duration', form.duration);
        formData.append('audioFile', audioFile);
        formData.append('imageFile', imageFile);

        // Only append albumId if an album was selected (not the default empty option)
        if (selectedAlbumId && selectedAlbumId !== '') {
             formData.append('albumId', selectedAlbumId);
        }

        try {
            // Use axiosInstance to send request
            const { data } = await axiosInstance.post(
                `${backendUrl}/api/song/create-song`, // Use full URL if axiosInstance doesn't have base URL
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast.success(data.message || 'Song created successfully!');
            clearForm();
            onSongCreated(); // Notify parent component
            // onCancel(); // Optionally close modal after success
        } catch (err) {
            console.error("Song creation error:", err);
            toast.error(err.response?.data?.message || err.message || 'Failed to create song.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh] custom-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Create New Song</h2>
                    <button
                        onClick={onCancel}
                        className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                        aria-label="Close modal"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Uploading Indicator */}
                    {isUploading && (
                        <div className="flex items-center justify-center mb-4 space-x-2">
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                            <span className='text-white'>Uploading...</span>
                        </div>
                    )}

                    {/* Title Input */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={handleChange}
                        className="p-3 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    {/* Artist Input */}
                    <input
                        type="text"
                        name="artist"
                        placeholder="Artist"
                        value={form.artist}
                        onChange={handleChange}
                        className="p-3 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    {/* Album Select (Dropdown) */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="album-select" className="text-sm font-medium text-gray-300">Album (optional):</label>
                        <select
                            id="album-select"
                            name="albumId" // Use name here for form submission if needed, but we use state
                            value={selectedAlbumId}
                            onChange={handleAlbumSelectChange}
                            className="p-3 cursor-pointer rounded-md text-white bg-[#303030] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {/* Default option for no album */}
                            <option value="">No Album</option>
                            {/* Map over albums prop to create options */}
                            {albums.map((album) => (
                              
                                <option className key={album._id} value={album._id}>
                                    {album.title}                                    
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* Duration Input */}
                    <input
                        type="text"
                        name="duration"
                        placeholder="Duration (e.g. 3:45)"
                        value={form.duration}
                        onChange={handleChange}
                        className="p-3 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    {/* Audio File Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="audio-file-input" className="text-sm font-medium text-gray-300">Audio File (MP3, WAV, etc.):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {audioFile ? audioFile.name : 'Choose Audio File'}
                            <input
                                id="audio-file-input"
                                type="file"
                                name="audioFile"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {/* Image File Input */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="image-file-input" className="text-sm font-medium text-gray-300">Image File (JPG, PNG, etc.):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {imageFile ? imageFile.name : 'Choose Image File'}
                            <input
                                id="image-file-input"
                                type="file"
                                name="imageFile"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {/* Image Preview */}
                    {imageFile && (
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="Image preview"
                            className="w-32 h-32 object-cover mt-2 rounded-md"
                             onLoad={() => URL.revokeObjectURL(imageFile)}
                        />
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`mt-4 p-2 rounded-md text-white font-bold transition ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer'}`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Song'}
                    </button>
                </form>
            </div>

            {/* CSS for custom scrollbar - Keep this here if you only want the modal to have this scrollbar style */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #303030;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }

                /* Firefox scrollbar styles */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #555 #303030;
                }
            `}</style>
        </div>
    );
};

export default AddSongForm;