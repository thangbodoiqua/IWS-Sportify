import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axiosInstance from "../AxiosInstance"; // Import AxiosInstance

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [playlists, setPlaylists] = useState([]); // State for playlists

    const getAuthState = async () => {
        try {
            const { data } = await axiosInstance.get(`${backendUrl}/api/auth/is-auth`);
            if (data.success) {
                setIsLoggedIn(true);
                getUserData();
                fetchPlaylists(); // Call fetchPlaylists after login
            } else {
                setIsLoggedIn(false);
                setPlaylists([]); // Reset playlists when not logged in
            }
        } catch (error) {
            toast.error(error.message);
            setIsLoggedIn(false);
            setPlaylists([]); // Reset playlists on error
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

    const filterPlaylistsContainingSong = (song) => {
        if (!song) {
            return playlists;
        }
        return playlists.filter(playlist => !playlist.songs.some(s => s._id === song._id));
    };

    const addSongToPlaylist = async (playlistId, songId) => {
        try {
            const response = await axiosInstance.post('/api/playlist/add-song', { playlistId, songId });
            if (response.data.success) {
                toast.success(response.data.message);
                // Cập nhật lại danh sách playlists sau khi thêm bài hát thành công
                fetchPlaylists();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to add song to playlist.";
            toast.error(message);
            console.error("Error adding song to playlist:", error);
        }
    };

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        user, setUser,
        getUserData,
        currentSong, setCurrentSong,
        playlists, setPlaylists, // Share playlists state
        fetchPlaylists, // Share fetchPlaylists function
        filterPlaylistsContainingSong, // Share filter function
        addSongToPlaylist // Share add song function
    };

    return (
        <AppContext.Provider value={{ value }}>
            {props.children}
        </AppContext.Provider>
    );
};