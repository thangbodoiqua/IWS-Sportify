import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import Player from "../components/Player";
import { AppContext } from "../context/AppContext";
import PlaylistSong from "../components/PlaylistSong";
import SongList from "../components/SongList";
import Playlist from "../components/AddSongToPlaylist";
import AlbumList from "../components/AlbumList";
import Album from "../components/Album";

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
    setSelectedAlbum(null); // Khi chọn playlist, bỏ chọn album
  };

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
    setSelectedPlaylist(null); // Khi chọn album, bỏ chọn playlist
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
          <SideBar
            onPlaylistSelect={handlePlaylistSelect}
            onAlbumSelect={handleAlbumSelect}
          />{" "}
          {/* Giả sử SideBar có thêm prop onAlbumSelect để hiển thị danh sách album */}
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
            <Album album={selectedAlbum} onBack={handleBackToSongList} />
          ) : (
            <>
            <h1 className="text-2xl text-bold text-white">Trendings:
              <SongList onOpenPlaylistModal={openPlaylistModal} />
            </h1>
            <h1 className="text-2xl text-bold text-white">Album:
              <AlbumList onAlbumSelect={handleAlbumSelect} />
            </h1>
              
            </>
          )}
        </div>
      </div>
      {isPlaylistModalVisible && songToAdd && (
        <Playlist song={songToAdd} onClose={closePlaylistModal} />
      )}
      {currentSong && (
        <Player onOpenPlaylistModal={openPlaylistModal} song={currentSong} />
      )}
    </div>
  );
};

export default Home;
