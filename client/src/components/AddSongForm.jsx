import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { XCircle } from 'lucide-react'; // Import icon

const AddSongForm = ({ onCancel, onSongCreated }) => {
    const { backendUrl } = useContext(AppContext).value;
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        artist: '',
        albumId: '',
        duration: '',
    });
    const [audioFile, setAudioFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'audioFile') setAudioFile(files[0]);
        if (name === 'imageFile') setImageFile(files[0]);
    };

    const clearForm = () => {
        setForm({ title: '', artist: '', albumId: '', duration: '' });
        setAudioFile(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        axios.defaults.withCredentials = true;

        if (!audioFile || !imageFile) {
            setIsUploading(false);
            return toast.error('Please upload both audio and image files');
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('artist', form.artist);
        formData.append('albumId', form.albumId);
        formData.append('duration', form.duration);
        formData.append('audioFile', audioFile);
        formData.append('imageFile', imageFile);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/song/create-song`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast.success(data.message);
            clearForm();
            onSongCreated(); // Notify parent component
            onCancel();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Create New Song</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={form.title}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <input
                        type="text"
                        name="artist"
                        placeholder="Artist"
                        value={form.artist}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <input
                        type="text"
                        name="albumId"
                        placeholder="Album ID (optional)"
                        value={form.albumId}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="text"
                        name="duration"
                        placeholder="Duration (e.g. 3:45)"
                        value={form.duration}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300">Audio File (MP3):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {audioFile ? audioFile.name : 'Choose Audio File'}
                            <input
                                type="file"
                                name="audioFile"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300">Image File (JPG/PNG):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {imageFile ? imageFile.name : 'Choose Image File'}
                            <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {imageFile && (
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="preview"
                            className="w-32 mt-2 rounded-md"
                        />
                    )}

                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`mt-4 p-2 rounded-md text-white font-bold transition ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'}`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Song'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSongForm;