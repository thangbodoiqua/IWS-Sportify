import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { FaPlay, FaTrash, FaPlus } from "react-icons/fa"; // Import FaPlus
import { IoArrowBackOutline } from "react-icons/io5";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { assets } from "../../assets/resources/assets";
import { toast } from "react-toastify";
import axiosInstance from "../../AxiosInstance";
import { useNavigate } from 'react-router-dom';
import Playlist from "./AddToPlaylistForm"; // Import Playlist component

const PlaylistSong = ({ playlist, onBack, onSongRemoved, fetchPlaylists }) => {
  const { setCurrentSong, backendUrl, playPlaylist } = useContext(AppContext).value; // Lấy hàm playPlaylist
  const [hoveredSongId, setHoveredSongId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal xóa bài hát
  const [songToRemove, setSongToRemove] = useState(null);

  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef(null);
  const navigate = useNavigate();

  const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);

  // State và hàm cho modal "Thêm vào playlist"
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

  const toggleOptionsMenu = () => {
    setIsOptionsMenuOpen(!isOptionsMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setIsOptionsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [optionsMenuRef]);

  useEffect(() => {
    if (playlist && playlist.songs) {
      setSongs(playlist.songs);
    } else {
      setSongs([]); 
    }
  }, [playlist]); 

  const handleSongSelect = (song) => {
    setCurrentSong(song);
  };

  const openModal = (songId, songTitle) => {
    setSongToRemove({ id: songId, title: songTitle });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSongToRemove(null);
  };

  const handleRemoveConfirmation = () => {
    if (songToRemove) {
      handleRemoveSong(songToRemove.id);
      closeModal();
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await axiosInstance.delete(
        `${backendUrl}/api/playlist/remove-song`,
        {
          data: {
            playlistId: playlist._id,
            songId,
          },
        }
      );

      if (response.data.success) {
        toast.success("Song removed from playlist successfully!");
        setSongs(songs.filter((song) => song._id !== songId));
        if (onSongRemoved) {
          onSongRemoved(songId);
        }
      } else {
        toast.error(
          response.data.message || "Failed to remove song from playlist."
        );
      }
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song from playlist.");
    }
  };

  // Hàm mở modal "Thêm vào playlist"
  const openAddToPlaylistModal = (song) => {
    setSelectedSongToAdd(song);
    setIsAddToPlaylistModalOpen(true);
  };

  // Hàm đóng modal "Thêm vào playlist"
  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedSongToAdd(null);
  };

  // Hàm mở modal xác nhận xóa playlist
  const openDeleteConfirmationModal = () => {
    setIsOptionsMenuOpen(false);
    setIsDeletePlaylistModalOpen(true);
  };

  // Hàm đóng modal xác nhận xóa playlist
  const closeDeleteConfirmationModal = () => {
    setIsDeletePlaylistModalOpen(false);
  };

  const handleConfirmDeletePlaylist = async () => {
    console.log("Deleting playlist with ID:", playlist._id);
    if (!playlist?._id) {
      toast.error("Playlist ID is invalid.");
      return;
    }
    try {
      const response = await axiosInstance.delete(
        `${backendUrl}/api/playlist/${playlist._id}`
      );
      console.log("delete data: " + response.data);
      if (response.data.success) {
        toast.success("Playlist deleted successfully!");
        fetchPlaylists();
        onBack();
      } else {
        toast.error(response.data.message || "Failed to delete playlist.");
      }
    } catch (error) {
      toast.error("Failed to delete playlist.");
    } finally {
      setIsDeletePlaylistModalOpen(false); // Đóng modal sau khi thực hiện
    }
  };

  return (
    <div className="text-white bg-gradient-to-b from-neutral-800 to-black p-4 rounded-lg relative">
      <div className=" flex justify-between">
        <button
          onClick={onBack}
          className="hover:bg-gray-800 cursor-pointer mb-4 inline-flex items-center bg-black bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-90 focus:outline-none"
        >
          <IoArrowBackOutline className="text-xl" />
        </button>
        <div ref={optionsMenuRef} className="relative">
          <button
            onClick={toggleOptionsMenu}
            className=" mr-10 cursor-pointer text-neutral-400 hover:text-white focus:outline-none"
            aria-label="More Options"
          >
            <HiOutlineDotsHorizontal size={28} />
          </button>
          {isOptionsMenuOpen && (
            <div className="absolute top-full right-0 mt-0 w-48 bg-neutral-800 rounded-md shadow-lg z-10">
              <button
                onClick={openDeleteConfirmationModal}
                className="block w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 hover:text-white focus:outline-none"
              >
                Delete Playlist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Header của Playlist --- */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
        {/* Ảnh bìa Playlist */}
        <img src={assets.soundIMG}
          alt={playlist.name}
          className="w-28 h-28 md:w-36 md:h-36 object-cover shadow-lg rounded-md flex-shrink-0"
        />
        {/* Thông tin Playlist */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 truncate">Playlist</h1>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 truncate"
            title={playlist.name}
          >
            {playlist.name}
          </h1>
          <div className="text-sm text-neutral-300 flex items-center flex-wrap justify-center md:justify-start gap-x-1">
            <span className="font-semibold text-white">
              {playlist.description}
            </span>
            {songs.length > 0 && (
              <>
                <span className="hidden md:inline mx-1"> • </span>
                <span>{songs.length} songs</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          className="bg-green-500 p-3 rounded-full text-black shadow-lg hover:bg-green-400 focus:outline-none transition transform hover:scale-105"
          aria-label="Play Playlist"
          onClick={() => playPlaylist(songs)} // Gọi hàm playPlaylist khi click
        >
          <FaPlay className="text-lg" />
        </button>

      
      </div>

      {songs && songs.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="space-y-1">
            {songs.map((song, index) => (
              <div
                key={song._id || index}
                className={`flex items-center justify-between p-3 rounded-md hover:bg-neutral-800 group cursor-pointer transition-colors ${
                  hoveredSongId === song._id ? "bg-neutral-800" : ""
                }`}
                onMouseEnter={() => setHoveredSongId(song._id)}
                onMouseLeave={() => setHoveredSongId(null)}
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => handleSongSelect(song)}
                >
                  <FaPlay className="text-white text-xs cursor-pointer" />
                  <img
                    src={song.imageUrl || assets.soundIMG}
                    alt={song.title}
                    className="w-10 h-10 object-cover rounded-sm"
                  />
                  <div>
                    <h3
                      className="text-white text-base font-medium truncate max-w-[180px]"
                      title={song.title}
                    >
                      {song.title}
                    </h3>
                    <p className="text-neutral-400 text-sm truncate max-w-[180px]"
                      title={song.artist}
                    >
                      {song.artist}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-neutral-400 truncate w-[150px] text-center">
                  {song.album || ""}
                </div>
                <div className="flex items-center gap-4 min-w-[130px] justify-end">
                  <div className="text-sm text-neutral-400 text-right w-12">
                    {song.duration
                      ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : ""}
                  </div>
                  
                  <button
                    onClick={() => openModal(song._id, song.title)}
                    className="text-red-500 hover:text-red-400 focus:outline-none"
                    aria-label={`Remove ${song.title} from playlist`}
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-neutral-400 mt-6 text-center">
          This playlist has no songs.
        </p>
      )}

      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-md flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-neutral-800 rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Removal</h2>
            <p className="mb-4">
              Are you sure you want to remove "{songToRemove?.title}" from this
              playlist?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-md py-2 px-4 focus:outline-none"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-400 text-white rounded-md py-2 px-4 focus:outline-none"
                onClick={handleRemoveConfirmation}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa playlist */}
      {isDeletePlaylistModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-md flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteConfirmationModal();
            }
          }}
        >
          <div className="bg-neutral-800 rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete the playlist "
              {playlist?.name}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-neutral-700 hover:bg-neutral-600 text-white rounded-md py-2 px-4 focus:outline-none"
                onClick={closeDeleteConfirmationModal}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-400 text-white rounded-md py-2 px-4 focus:outline-none"
                onClick={handleConfirmDeletePlaylist}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal "Thêm vào playlist" */}
      {isAddToPlaylistModalOpen && (
        <Playlist
          songToAdd={selectedSongToAdd}
          onClose={closeAddToPlaylistModal}
        />
      )}
    </div>
  );
};

export default PlaylistSong;