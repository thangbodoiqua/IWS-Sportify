import React, { useState, useContext } from 'react';
import axios from 'axios'; // Sử dụng axios trực tiếp
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { XCircle } from 'lucide-react';

const AddAlbumForm = ({ onCancel, onAlbumCreated }) => {
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
        // Optional: Add file type and size validation here
        if (file) setCoverFile(file);
    };

    const clearForm = () => {
        setForm({ title: '', description: '' });
        setCoverFile(null);
        // Clear file input value if needed, requires referencing the input
        // const fileInput = document.getElementById('cover-file-input'); // Add an ID to the input
        // if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        // axios.defaults.withCredentials = true; // Should be configured in AxiosInstance

        if (!form.title) { // Added validation for title
             setIsUploading(false);
             toast.error('Album title is required.');
             return;
        }

        if (!coverFile) {
            setIsUploading(false);
            return toast.error('Please upload a cover image for the album.');
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('coverFile', coverFile);

        try {
            // Use axiosInstance instead of global axios
            const { data } = await axios.post(
                `${backendUrl}/api/album/create-album`, // Sử dụng URL đầy đủ nếu axiosInstance không có base URL
                // Nếu axiosInstance đã có base URL, dùng '/api/album/create-album'
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
                // withCredentials should be handled by axiosInstance
            );
            toast.success(data.message || 'Album created successfully!');
            clearForm();
            onAlbumCreated(); // Gọi callback để thông báo cho AdminDashboard album đã được tạo
            // onCancel(); // Optionally close modal after successful creation
        } catch (err) {
            console.error("Album creation error:", err);
            toast.error(err.response?.data?.message || err.message || 'Failed to create album.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"> {/* Added p-4 for small screens */}
            {/* Modal Content Container */}
            <div className="bg-[#1f1f1f] rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh] custom-scrollbar"> {/* Added custom-scrollbar class */}

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Create New Album</h2>
                    {/* Close Button with cursor-pointer (already present) */}
                    <button
                        onClick={onCancel}
                        className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                        aria-label="Close modal" // Added accessibility label
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Uploading Indicator */}
                    {isUploading && (
                        <div className="flex items-center justify-center mb-4 space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-white">Uploading...</span>
                        </div>
                    )}

                    {/* Title Input */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Album Title"
                        value={form.title}
                        onChange={handleChange}
                        className="p-3 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        required
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300">Cover Image (JPG/PNG):</label>
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            {coverFile ? coverFile.name : 'Choose Cover Image'}
                            <input
                                id="cover-file-input" // Added ID for potential clearing
                                type="file"
                                name="coverFile"
                                accept="image/jpeg, image/png, image/webp" // Specify image types
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                        </label>
                    </div>

                    {coverFile && (
                        <img
                            src={URL.createObjectURL(coverFile)}
                            alt="Cover preview" // Added alt text
                            className="w-32 h-32 object-cover mt-2 rounded-md" // Added object-cover and fixed height
                            onLoad={() => URL.revokeObjectURL(coverFile)} // Clean up object URL after load
                        />
                    )}

                    <textarea
                        name="description"
                        placeholder="Description (Optional)"
                        value={form.description}
                        onChange={handleChange}
                        className="p-3 rounded-md text-white bg-[#303030] border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3" // Added default rows
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isUploading}
                        // Added cursor-pointer for enabled state
                        className={`mt-4 p-2 rounded-md text-white font-bold transition ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer'}`}
                    >
                        {isUploading ? 'Creating Album...' : 'Create Album'}
                    </button>
                </form>
            </div>

            {/* CSS for custom scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px; /* Width for vertical scrollbar */
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #303030; /* Dark track color */
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #555; /* Slightly lighter thumb color */
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #777; /* Thumb color on hover */
                }

                /* Firefox scrollbar styles */
                .custom-scrollbar {
                    scrollbar-width: thin; /* "auto" or "thin" */
                    scrollbar-color: #555 #303030; /* thumb track */
                }
            `}</style>
        </div>
    );
};

export default AddAlbumForm;