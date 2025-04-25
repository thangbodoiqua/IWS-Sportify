import React, { useRef, useState, useEffect, useContext } from "react";
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Repeat,
    Volume2,
    VolumeX,
    Plus, // Import icon Plus
    ListMusic, // Import icon for Queue
} from "lucide-react";
import { AppContext } from "../context/AppContext"; // Import AppContext
import Playlist from "./AddSongToPlaylist"; // Import Playlist component
import QueueSong from "../components/QueueSong"; // Import QueueSong component

const Player = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isRepeat, setIsRepeat] = useState(false);
    const { value } = useContext(AppContext);
    const { currentSong, nextSong, previousSong } = value; 
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [isQueueVisible, setIsQueueVisible] = useState(false); 

    useEffect(() => {
        if (!currentSong) return;
        const audio = audioRef.current;
        audio.pause();
        audio.load();
    
        const onLoaded = () => {
          setDuration(audio.duration);
          if (isPlaying) { // Chỉ play nếu đang phát trước đó
            audio.play().catch((err) => console.error("Autoplay failed:", err));
          }
        };
    
        const onTime = () => setCurrentTime(audio.currentTime);
    
        const onEnded = () => {
          if (isRepeat) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            nextSong();
          }
        };
    
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnded);
    
        return () => {
          audio.removeEventListener("loadedmetadata", onLoaded);
          audio.removeEventListener("timeupdate", onTime);
          audio.removeEventListener("ended", onEnded);
        };
      }, [currentSong, isRepeat, nextSong, isPlaying]); // Thêm isPlaying vào dependencies

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;
    if (isRepeat && !isPlaying && currentTime > 0 && currentTime === duration) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    }
  }, [isRepeat, isPlaying, currentTime, duration, currentSong]);

  const togglePlay = () => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const t = Number(e.target.value);
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setIsMuted(volume === 0);
      setCurrentVolume(volume);
    }
  };

  const clickSoundIcon = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = currentVolume;
      setIsMuted(false);
    } else {
      setCurrentVolume(audio.volume);
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`; 
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;

      
      const isTyping =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      
      if (!isTyping && e.key === " ") {
        e.preventDefault();
        togglePlay(); 
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup: Loại bỏ event listener khi component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay]); // Thêm togglePlay vào dependencies để đảm bảo nó luôn là phiên bản mới nhất

  // Hàm mở modal "Thêm vào playlist"
  const openAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(true);
  };

  // Hàm đóng modal "Thêm vào playlist"
  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
  };

  // Hàm mở/đóng queue modal
  const toggleQueueVisibility = () => {
    setIsQueueVisible(!isQueueVisible);
  };

  if (!currentSong) {
    return (
        <div className="fixed bottom-0 left-0 w-full h-20 bg-[#000000] text-white flex items-center justify-center px-20 gap-4 z-50 shadow-md">
            <p>Chưa có bài hát nào được chọn.</p>
        </div>
    );
}

  return (
    <div className="fixed bottom-0 left-0 w-full h-20 bg-[#000000] text-white flex items-center justify-between px-20 gap-4 z-50 shadow-md">
      <div className="flex items-center justify-between gap-4 w-full">
        <audio ref={audioRef}>
          <source src={currentSong.audioUrl} type="audio/mpeg" />
        </audio>

        <div className="flex items-center gap-4">
          <img
            src={currentSong.imageUrl}
            alt={currentSong.title}
            className="w-16 h-16 rounded-md shadow"
          />
          <div className="flex flex-col">
            <p className="truncate font-semibold text-lg">
              {currentSong.title}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {currentSong.artist}
            </p>
          </div>
          {/* Button "Thêm vào playlist" */}
          <button
            onClick={openAddToPlaylistModal}
            className="text-blue-500 hover:text-blue-400 focus:outline-none"
            aria-label={`Add ${currentSong.title} to playlist`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="w-[60%] flex items-center">
          <div className="flex gap-4">
            <button
              onClick={previousSong}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Previous Song"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 focus:outline-none"
            >
              {isPlaying ? (
                <Pause className="w-7 cursor-pointer h-7" />
              ) : (
                <Play className="w-7 cursor-pointer h-7" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Next Song"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-1 items-center gap-4 min-w-0">
            <span>{formatTime(currentTime)}</span>{" "}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 rounded-full bg-gray-700 accent-green-500 cursor-pointer"
            />
            <span>{formatTime(duration)}</span>{" "}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Repeat Icon */}
          <button
            className={`cursor-pointer focus:outline-none transition-colors duration-150 ${
              isRepeat ? "text-green-500" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => {
              setIsRepeat((prev) => !prev);
            }}
          >
            <Repeat className="w-5 h-5" />
          </button>

          {/* Volume */}
          <div className="relative group flex items-center justify-center">
            <button
              className="text-gray-400 cursor-pointer hover:text-white focus:outline-none"
              onClick={() => clickSoundIcon()}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-6 h-28 group-hover:flex hidden items-center justify-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentVolume}
                onChange={handleVolumeChange}
                className="w-24 rotate-[-90deg] accent-green-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Queue Icon */}
          <button
            onClick={toggleQueueVisibility}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label="View Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Modal "Thêm vào playlist" */}
      {isAddToPlaylistModalOpen && currentSong && (
        <Playlist song={currentSong} onClose={closeAddToPlaylistModal} />
      )}
      {/* Queue Modal */}
      {isQueueVisible && <QueueSong onClose={toggleQueueVisibility} />}
    </div>
  );
};

export default Player;
