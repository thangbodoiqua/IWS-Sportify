import React, { useContext, useState } from 'react';
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiHome, FiSearch, FiPlus } from 'react-icons/fi';
import AddSongForm from './AddSongForm'; // Import the modal
import axiosInstance from '../AxiosInstance';

const Navbar = ({ onHomeClick }) => { // Receive the onHomeClick prop
    const navigate = useNavigate();
    const { user, backendUrl, setUser, setIsLoggedIn } = useContext(AppContext).value;
    const [isCreateSongModalOpen, setIsCreateSongModalOpen] = useState(false); // State for modal

    const handleAddSongClick = () => {
        if (user) {
            setIsCreateSongModalOpen(true); // Open the modal
        } else {
            toast.error("Please log in to add a song.");
        }
    };

    const handleSongCreated = () => {
        setIsCreateSongModalOpen(false);
        // You can add logic here to refresh the song list or do any other necessary action
    }

    const logout = async () => {
        try {
            const { data } = await axiosInstance.post(backendUrl + "/api/auth/logout");;
            data.success && setIsLoggedIn(false);
            data.success && setUser(false);
            navigate('/login');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='w-full flex justify-between items-center py-2 px-4 sm:px-6 bg-gray-900 text-white sticky top-0 z-50'>
            <div className='flex items-center gap-2'>
                <FiHome
                    className='text-xl hover:text-gray-500 cursor-pointer'
                    onClick={onHomeClick} // Call the passed function on click
                />
                <div className="relative">
                    <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-800 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className='flex items-center gap-3'>
                {user && (
                    <button onClick={handleAddSongClick} className='flex items-center gap-1 cursor-pointer hover:text-gray-500 transition-all text-sm'>
                        <FiPlus className="text-lg" />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                )}

                {user ? (
                    <div className='w-7 h-7 flex justify-center items-center rounded-full cursor-pointer transition-all bg-black text-white relative group text-xs'>
                        {user.username[0].toUpperCase()}
                        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-8 shadow-md'>
                            <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
                                <li className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Profile</li>
                                <li onClick={logout} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => navigate('/login')} className='flex items-center gap-2 border cursor-pointer border-gray-500 rounded-full px-3 py-1.5 text-gray-100 hover:bg-gray-500 transition-all text-sm'>
                        Sign Up
                        <img src={assets.arrow_icon} alt="Arrow icon" className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Render the modal */}
            {isCreateSongModalOpen && (
                <AddSongForm
                    onCancel={() => setIsCreateSongModalOpen(false)}
                    onSongCreated={handleSongCreated}
                />
            )}
        </div>
    );
};

export default Navbar;