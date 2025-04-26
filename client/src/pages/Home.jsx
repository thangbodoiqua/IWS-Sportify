import React, { useContext, useState, useEffect } from "react";
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


const Home = () => {
    const { currentSong } = useContext(AppContext).value;
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

    const handlePlaylistSelect = (playlist) => {
        setSelectedPlaylist(playlist);
        setSelectedAlbum(null); 
    };

    const handleAlbumSelect = (album) => {
        setSelectedAlbum(album);
        setSelectedPlaylist(null); 
    };

    const handleBackToSongList = () => {
        setSelectedPlaylist(null);
        setSelectedAlbum(null);
    };

    const openPlaylistModal = (song) => {
        setSongToAdd(song);
        setIsPlaylistModalVisible(true);
    };

    const closePlaylistModal = () => {
        setIsPlaylistModalVisible(false);
        setSongToAdd(null);
    };

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
                        onAlbumSelect={handleAlbumSelect}
                    />
                </div>
                <div className="m-4 rounded flex-grow p-4 overflow-y-auto bg-[#121212] h-[80%]">
                    {selectedPlaylist ? (
                        <PlaylistSong
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
                            <h1 className="text-2xl font-bold text-white mt-6">Albums</h1>
                            <AlbumList onAlbumSelect={handleAlbumSelect} />
                        </>
                    )}
                </div>
            </div>
            {isPlaylistModalVisible && songToAdd && (
                <AddToPlaylistForm song={songToAdd} onClose={closePlaylistModal} />
            )}
            {currentSong && (
                <Player onOpenPlaylistModal={openPlaylistModal} song={currentSong} />
            )}
        </div>
    );
};

export default Home;