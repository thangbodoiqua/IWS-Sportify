import React, { useContext, useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Playlists from "../components/Playlist/Playlists";
import Player from "../components/Player";
import { AppContext } from "../context/AppContext";
import PlaylistSong from "../components/Playlist/PlaylistSong";
import AlbumList from "../components/albums/AlbumList";
import Album from "../components/albums/Album";
import AddToPlaylistForm from "../components/Playlist/AddToPlaylistForm";
import FeaturedSongs from "../components/Songs/FeaturedSongs";
import TrendingSong from "../components/Songs/TrendingSong";
import MadeForYouSongs from "../components/Songs/MadeForYouSongs";
import { toast } from "react-toastify";
import axiosInstance from "../AxiosInstance";
const Home = () => {
    const { currentSong, isLoggedIn } = useContext(AppContext).value;
    const [playlists, setPlaylists] = useState([]);

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [windowHeight, setWindowHeight] = useState("100vh");
    const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(`${window.innerHeight}px`);
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleAlbumSelect = (album) => {
        setSelectedAlbum(album);
        setSelectedPlaylist(null); 
    };

    const fetchPlaylists = useCallback(async () => {
        if(isLoggedIn){
            try {
                const response = await axiosInstance.get("/api/playlist");
                setPlaylists(response.data.playlists || []);
            } catch (err) {
                toast.error("Failed to fetch playlists.");
                console.error("Failed to fetch playlists in Home:", err);
                setPlaylists([]);
            }
        }
        
    }, []);

    const addSongToPlaylist = useCallback(async (playlistId, songId) => {
        try {
            const response = await axiosInstance.post("/api/playlist/add-song", {
                playlistId,
                songId,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPlaylists(); // Gọi lại để cập nhật danh sách playlist
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to add song to playlist.");
            console.error("Error adding song to playlist:", error);
        }
    }, [fetchPlaylists]);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

      const handlePlaylistSelect = (playlist) => {
        setSelectedPlaylist(playlist);
        setSelectedAlbum(null);
    };
    const handleBackToSongList = () => {
        setSelectedPlaylist(null);
        setSelectedAlbum(null);
    };
    const openPlaylistModal = useCallback((song) => {
        setSongToAdd(song);
        setIsPlaylistModalVisible(true);
    }, []);
  
    const closePlaylistModal = useCallback(() => {
        setIsPlaylistModalVisible(false);
        setSongToAdd(null);
    }, []);

    return (
        <div
            className="bg-[#000000] flex flex-col"
            style={{ height: windowHeight, overflow: "hidden" }}
        >
            <Navbar onHomeClick={handleBackToSongList} />
            <div className=" flex flex-grow overflow-hidden h-[80%]">
                <div className="bg-[#121212] mt-4 rounded w-[25%] h-[80%] overflow-y-auto">
                    <Playlists
                        onPlaylistSelect={handlePlaylistSelect}
                        playlists={playlists}
                        onAlbumSelect={handleAlbumSelect}
                        fetchPlaylists={fetchPlaylists} // Truyền fetchPlaylists xuống

                    />
                </div>
                <div className="m-4 rounded flex-grow p-4 overflow-y-auto bg-[#121212] h-[80%]">
                    {selectedPlaylist ? (
                        <PlaylistSong
                            fetchPlaylists={fetchPlaylists}
                            playlist={selectedPlaylist}
                            onBack={handleBackToSongList}
                            onSongRemoved={(removedSongId) => {
                                setSelectedPlaylist((prevPlaylist) => ({
                                    ...prevPlaylist,
                                    songs: prevPlaylist.songs.filter(
                                        (song) => song._id !== removedSongId
                                    ),
                                }));
                            }}
                        />
                    ) : selectedAlbum ? (
                        <Album album={selectedAlbum} onBack={handleBackToSongList} onOpenPlaylistModal={openPlaylistModal} />
                    ) : (
                        <>
                            <FeaturedSongs onOpenPlaylistModal={openPlaylistModal} />
                            <TrendingSong onOpenPlaylistModal={openPlaylistModal} />
                            <MadeForYouSongs onOpenPlaylistModal={openPlaylistModal} />
                            <AlbumList onAlbumSelect={handleAlbumSelect} />
                        </>
                    )}
                </div>
            </div>
            {isPlaylistModalVisible && songToAdd && (
    <AddToPlaylistForm
        song={songToAdd}
        onClose={closePlaylistModal}
        onAddToPlaylist={addSongToPlaylist}
        playlists={playlists} // Truyền danh sách playlists
    />
)}
            {currentSong && (
                <Player onOpenPlaylistModal={openPlaylistModal} song={currentSong} />
            )}
        </div>
    );
};

export default Home;