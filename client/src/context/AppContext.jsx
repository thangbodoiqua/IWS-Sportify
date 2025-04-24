import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axiosInstance from "../AxiosInstance"; // Import AxiosInstance

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [playlists, setPlaylists] = useState([]); // State cho playlists

    const getAuthState = async () => {
        try {
            const { data } = await axiosInstance.get(`${backendUrl}/api/auth/is-auth`);
            if (data.success) {
                setIsLoggedIn(true);
                getUserData();
                fetchPlaylists(); // Gọi fetchPlaylists sau khi đăng nhập
            } else {
                setIsLoggedIn(false);
                setPlaylists([]); // Reset playlists khi chưa đăng nhập
            }
        } catch (error) {
            toast.error(error.message);
            setIsLoggedIn(false);
            setPlaylists([]); // Reset playlists khi có lỗi
        }
    }

    useEffect(() => {
        getAuthState();
    }, []);

    const getUserData = async () => {
        try {
            const { data } = await axiosInstance.get(`${backendUrl}/api/user/data`);
            data.success ? setUser(data.userData) : toast.error(data.message);
            console.log(data.userData);
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        }
    }

    const fetchPlaylists = async () => {
        try {
            const response = await axiosInstance.get('/api/playlist');
            setPlaylists(response.data.playlists || []);
            console.log('Playlists fetched in AppContext:', response.data.playlists);
        } catch (err) {
            toast.error("Failed to fetch playlists.");
            console.error('Failed to fetch playlists in AppContext:', err);
            setPlaylists([]);
        }
    };

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        user, setUser,
        getUserData,
        currentSong, setCurrentSong,
        playlists, setPlaylists, // Chia sẻ state playlists
        fetchPlaylists // Chia sẻ hàm fetchPlaylists
    };

    return (
        <AppContext.Provider value={{ value }}>
            {props.children}
        </AppContext.Provider>
    );
};