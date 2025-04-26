import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from "../assets/assets";
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiHome, FiSearch, FiSettings } from 'react-icons/fi';
import axiosInstance from '../AxiosInstance';

const Navbar = ({ onHomeClick }) => {
    const navigate = useNavigate();
    const { user, backendUrl, setUser, setIsLoggedIn } = useContext(AppContext).value;
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const avatarRef = useRef(null);

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

    const handleAvatarHover = () => {
        setIsProfileMenuOpen(true);
    };

    const handleMouseLeave = () => {
        // Sử dụng setTimeout để cho phép chuột di chuyển vào menu trước khi ẩn
        setTimeout(() => {
            if (profileMenuRef.current && !profileMenuRef.current.matches(':hover') && avatarRef.current && !avatarRef.current.matches(':hover')) {
                setIsProfileMenuOpen(false);
            }
        }, 150); // Thời gian chờ nhỏ
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target) && avatarRef.current && !avatarRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileMenuRef, avatarRef]);

    return (
        <div className='w-full flex justify-between items-center py-2 px-4 sm:px-6 bg-gray-900 text-white sticky top-0 z-50'>
            <div className='flex items-center gap-2'>
                <FiHome
                    className='text-3xl hover:text-gray-500 cursor-pointer'
                    onClick={onHomeClick}
                />
                {/* <div className="relative">
                    <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-800 rounded-md py-1.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                    />
                </div> */}
            </div>

            <div className='flex items-center gap-3'>
                {user.isAdmin && (
                    <button onClick={() => navigate('/admin')} className='flex items-center mr-5 gap-1 cursor-pointer hover:text-gray-500 transition-all text-sm'>
                        <FiSettings className="text-3xl " />
                        <span className="hidden sm:inline">Admin</span>
                    </button>
                )}

                {user ? (
                    <div
                        ref={avatarRef}
                        className='w-8 h-8 flex justify-center items-center rounded-full cursor-pointer transition-all bg-black text-white relative group text-xs font-semibold'
                        onMouseEnter={handleAvatarHover}
                        onMouseLeave={handleMouseLeave}
                    >
                        {user.username[0].toUpperCase()}
                        <div
                            ref={profileMenuRef}
                            className={`absolute top-full mt-2 right-0 z-10 rounded shadow-md w-32 bg-gray-800 border border-gray-700 ${isProfileMenuOpen ? '' : 'hidden'}`}
                        >
                            <ul className='list-none m-0 p-0 text-sm'>
                                <li onClick={() => navigate('/account')} className='py-2 px-4 hover:bg-gray-700 cursor-pointer transition-colors'>
                                    Profile
                                </li>
                                <li onClick={logout} className="py-2 px-4 hover:bg-gray-700 cursor-pointer transition-colors border-t border-gray-700">
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
        </div>
    );
};

export default Navbar;