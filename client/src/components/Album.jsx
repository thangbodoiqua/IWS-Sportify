import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { FaPlay, FaTrash, FaPlus } from 'react-icons/fa'; // Import FaPlus
import { IoArrowBackOutline } from 'react-icons/io5';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { assets } from '../assets/resources/assets';
import { toast } from 'react-toastify';
import axiosInstance from '../AxiosInstance';
import Playlist from './AddSongToPlaylist'; // Import Playlist component

const Album = ({ album, onBack }) => {
  const { setCurrentSong, playPlaylist } = useContext(AppContext).value;
  const [hoveredSongId, setHoveredSongId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState(null);

  useEffect(() => {
    if (album && album.songs) {
      setSongs(album.songs);
    } else {
      setSongs([]);
    }
  }, [album]);

  const handleSongSelect = (song) => {
    setCurrentSong(song);
  };

  const openAddToPlaylistModal = (song) => {
    setSelectedSongToAdd(song);
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setSelectedSongToAdd(null);
  };

  if (!album) {
    return <div className="p-6 text-white">No album selected.</div>;
  }

  return (
    <div className="text-white bg-gradient-to-b from-neutral-800 to-black p-4 rounded-lg relative">
      <div className=" flex justify-between">
        <button
          onClick={onBack}
          className="hover:bg-gray-800 cursor-pointer mb-4 inline-flex items-center bg-black bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-90 focus:outline-none"
        >
          <IoArrowBackOutline className="text-xl" />
        </button>
        <div className="mr-10" />
      </div>

      {/* --- Header của Album --- */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
        {/* Ảnh bìa Album */}
        <img
          src={album.coverUrl}
          alt={album.name}
          className="w-28 h-28 md:w-36 md:h-36 object-cover shadow-lg rounded-md flex-shrink-0"
        />
        {/* Thông tin Album */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-0">
            <h1 className='className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 truncate"' >Album</h1>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 truncate"
            title={album.title}
          >
            {album.title}
          </h1>
          <div className="text-sm text-neutral-300 flex items-center flex-wrap justify-center md:justify-start gap-x-1">
            <span className="font-semibold text-white">{album.description}</span>
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
          aria-label="Play Album"
          onClick={() => playPlaylist(songs)} // Reusing playPlaylist, adjust if needed
        >
          <FaPlay className="text-lg" />
        </button>

        <div className="ml-auto">
          <button className="text-neutral-400 hover:text-white text-sm flex items-center gap-1 focus:outline-none">
            Song List
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {songs && songs.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="space-y-1">
            {songs.map((song, index) => (
              <div
                key={song._id || index}
                className={`flex items-center justify-between p-3 rounded-md hover:bg-neutral-800 group cursor-pointer transition-colors ${
                  hoveredSongId === song._id ? 'bg-neutral-800' : ''
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
                    <p
                      className="text-neutral-400 text-sm truncate max-w-[180px]"
                      title={song.artist}
                    >
                      {song.artist}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-sm text-neutral-400 truncate w-[150px] text-center">
                  {song.album || album.name}
                </div>
                <div className="flex items-center gap-4 min-w-[130px] justify-end">
                  <div className="text-sm text-neutral-400 text-right w-12">
                    {song.duration
                      ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                          .toString()
                          .padStart(2, '0')}`
                      : ''}
                  </div>
                  <button
                    onClick={() => openAddToPlaylistModal(song)} // Mở modal thêm vào playlist
                    className="text-blue-500 hover:text-blue-400 focus:outline-none"
                    aria-label={`Add ${song.title} to another playlist`}
                  >
                    <FaPlus size={16} />
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-neutral-400 mt-6 text-center">This album has no songs.</p>
      )}


      {/* Modal "Thêm vào playlist" */}
      {isAddToPlaylistModalOpen && (
        <Playlist songToAdd={selectedSongToAdd} onClose={closeAddToPlaylistModal} />
      )}
    </div>
  );
};

export default Album;