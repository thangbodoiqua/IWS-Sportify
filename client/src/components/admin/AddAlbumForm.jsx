import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { XCircle } from 'lucide-react';

const AddAlbumForm = ({ onCancel, onAlbumCreated }) => { // Nhận prop onAlbumCreated
    const { backendUrl } = useContext(AppContext).value;
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
    });
    const [coverFile, setCoverFile] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setCoverFile(file);
    };

    const clearForm = () => {
        setForm({ title: '', description: '' });
        setCoverFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        axios.defaults.withCredentials = true;

        if (!coverFile) {
            setIsUploading(false);
            return toast.error('Please upload a cover image for the album.');
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('coverFile', coverFile);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/album/create-album`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast.success(data.message || 'Album created successfully!');
            clearForm();
            onAlbumCreated(); // Gọi callback để thông báo cho AdminDashboard
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
                    <h2 className="text-2xl font-bold text-white">Create New Album</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {isUploading && (
                        <div className="flex items-center justify-center mb-4 space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-white">Uploading...</span>
                        </div>
                    )}
                    <input
                        type="text"
                        name="title"
                        placeholder="Album Title"
                        value={form.title}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300">Cover Image (JPG/PNG):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {coverFile ? coverFile.name : 'Choose Cover Image'}
                            <input
                                type="file"
                                name="coverFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {coverFile && (
                        <img
                            src={URL.createObjectURL(coverFile)}
                            alt="preview"
                            className="w-32 mt-2 rounded-md"
                        />
                    )}

                    <textarea
                        name="description"
                        placeholder="Description (Optional)"
                        value={form.description}
                        onChange={handleChange}
                        className="p-2 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`mt-4 p-2 rounded-md text-white font-bold transition ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}`}
                    >
                        {isUploading ? 'Uploading...' : 'Create Album'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAlbumForm;