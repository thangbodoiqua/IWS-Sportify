import React, { useRef, useState, useEffect, useContext, useCallback } from "react";
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Repeat,
    Volume2,
    VolumeX,
    Plus,
    ListMusic,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import AddToPlaylistForm from "./Playlist/AddToPlaylistForm";
import QueueSong from "../components/QueueSong";

const Player = () => {
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isRepeat, setIsRepeat] = useState(false);
    const { value } = useContext(AppContext);
    const { currentSong, nextSong, previousSong, isPlaying, setIsPlaying } = value;
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [isQueueVisible, setIsQueueVisible] = useState(false);
    const [hasLoadedCurrentSong, setHasLoadedCurrentSong] = useState(false);

    // Effect để xử lý loading và gắn/gỡ listeners cho audio (Logic JS không thay đổi)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!currentSong) {
            audio.src = '';
            setDuration(0);
            setCurrentTime(0);
            setIsPlaying(false);
            setHasLoadedCurrentSong(false);
            return;
        }

        if (audio.currentSrc !== currentSong.audioUrl) {
            console.log("Song changed, reloading audio source");
            audio.src = currentSong.audioUrl;
            audio.load();
            setCurrentTime(0);
            setHasLoadedCurrentSong(false);
        } else if (!hasLoadedCurrentSong && currentSong.audioUrl) {
        }


        const onLoadedMetadata = () => {
            console.log("Metadata loaded, duration:", audio.duration);
            setDuration(audio.duration);
            setHasLoadedCurrentSong(true);
             if (value.isPlaying) {
                 audio.play().catch((err) => console.error("Autoplay failed on loadedmetadata:", err));
            }
        };

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onEnded = () => {
            if (isRepeat) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            } else {
                nextSong();
            }
        };

        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
        };
    }, [currentSong, isRepeat, nextSong, value]);

    // Effect riêng để xử lý play/pause khi isPlaying thay đổi (Logic JS không thay đổi)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong || !hasLoadedCurrentSong) {
            return;
        }

        if (isPlaying) {
            audio.play().catch(err => console.error("Error playing:", err));
        } else {
            audio.pause();
        }
    }, [isPlaying, hasLoadedCurrentSong, currentSong]);


    const togglePlay = () => { // Logic JS không thay đổi
        if (!currentSong) return;
        const audio = audioRef.current;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => { // Logic JS không thay đổi
        const t = Number(e.target.value);
         if (audioRef.current && !isNaN(audioRef.current.duration)) {
             audioRef.current.currentTime = t;
             setCurrentTime(t);
         }
    };

    const handleVolumeChange = (e) => { // Logic JS không thay đổi
        const volume = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = volume;
            setIsMuted(volume === 0);
            setCurrentVolume(volume);
        }
    };

    const clickSoundIcon = () => { // Logic JS không thay đổi
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
             audio.volume = currentVolume > 0 ? currentVolume : 0.5;
            setIsMuted(false);
        } else {
            setCurrentVolume(audio.volume);
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const formatTime = (secs) => { // Logic JS không thay đổi
        if (isNaN(secs) || secs < 0) return "00:00";
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(secs % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    };

     const memoizedTogglePlay = useCallback(() => { // Logic JS không thay đổi
        if (!currentSong) return;
         setIsPlaying(prev => !prev);
     }, [currentSong, setIsPlaying]);

    useEffect(() => { // Logic JS không thay đổi
        const handleKeyDown = (e) => {
            const activeElement = document.activeElement;

            const isTyping =
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.isContentEditable;

            if (!isTyping && e.key === " ") {
                e.preventDefault();
                memoizedTogglePlay();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [memoizedTogglePlay]);

    const openAddToPlaylistModal = () => { // Logic JS không thay đổi
         if (!currentSong) {
              toast.info("Please select a song first.");
              return;
         }
        setIsAddToPlaylistModalOpen(true);
    };

    const closeAddToPlaylistModal = () => { // Logic JS không thay đổi
        setIsAddToPlaylistModalOpen(false);
    };

    const toggleQueueVisibility = () => { // Logic JS không thay đổi
        setIsQueueVisible(!isQueueVisible);
    };

    // Render khi không có bài hát (Chỉ chỉnh sửa Tailwind)
    if (!currentSong) {
        return (
            <div className="fixed bottom-0 left-0 w-full h-16 sm:h-20 bg-black text-gray-400 flex items-center justify-center px-4 sm:px-6 md:px-8 z-50 shadow-md text-sm sm:text-base">
                <p>No song selected.</p>
            </div>
        );
    }

    // --- Cấu trúc Responsive chỉ bằng chỉnh sửa Tailwind trên HTML gốc ---
    return (
        // Container chính: Giữ nguyên cấu trúc HTML, chỉ chỉnh sửa lớp
        // Điều chỉnh padding, bỏ chiều cao cố định lg, thêm flex-wrap để con xuống dòng
        <div className="fixed bottom-0 left-0 w-full h-auto bg-black text-white flex items-center justify-between px-4 sm:px-0 md:px-8 lg:px-12 py-3 gap-2 sm:gap-4 flex-wrap z-50 shadow-md">

  <div className="flex items-center justify-between w-full flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 min-h-0 sm:justify-around">
    <audio ref={audioRef}>
      <source src={currentSong.audioUrl} type="audio/mpeg" />
    </audio>

    {/* Info */}
    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-row flex-shrink-0 min-w-0 md:mb-0">
      <img
        src={currentSong.imageUrl}
        alt={currentSong.title}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-sm object-cover flex-shrink-0"
      />
      <div className="flex flex-col items-start min-w-0">
        <p className="truncate font-semibold text-sm sm:text-base lg:text-lg">{currentSong.title}</p>
        <p className="text-xs sm:text-sm text-gray-400 truncate">{currentSong.artist}</p>
      </div>
    </div>

    {/* Controls */}
    <div className="flex items-center flex-col md:flex-row sm:w-[60%] md:flex-1 gap-2 sm:gap-4 max-w-xl lg:max-w-3xl mt-2 md:mt-0 min-w-0">
      
      {/* Buttons */}
      <div className="flex gap-3 justify-center w-full md:w-auto flex-shrink-0">
        <button onClick={previousSong} className="text-gray-400 hover:text-white focus:outline-none" aria-label="Previous Song">
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={togglePlay}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 focus:outline-none flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
        </button>
        <button onClick={nextSong} className="text-gray-400 hover:text-white focus:outline-none" aria-label="Next Song">
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Seek Bar */}
      <div className="flex flex-1 items-center gap-2 sm:gap-3 w-full min-w-0">
        <span className="text-xs sm:text-sm text-gray-400">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="h-1 rounded-full bg-gray-700 accent-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-1 max-w-[150px] sm:max-w-none"
          disabled={isNaN(duration) || duration === 0}
        />
        <span className="text-xs sm:text-sm text-gray-400">{formatTime(duration)}</span>
      </div>
    </div>

    {/* Volume & Misc */}
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-shrink-0 mt-2 md:mt-0 w-auto min-w-0">
      <button onClick={openAddToPlaylistModal} className="text-gray-400 hover:text-white focus:outline-none" aria-label="Add to Playlist">
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => setIsRepeat((prev) => !prev)}
        className={`cursor-pointer focus:outline-none transition-colors duration-150 ${
          isRepeat ? "text-green-500" : "text-gray-400 hover:text-white"
        }`}
        aria-label={isRepeat ? "Disable repeat" : "Enable repeat"}
      >
        <Repeat className="w-5 h-5" />
      </button>

      {/* Volume */}
      <div className="relative group flex items-center justify-center">
        <button
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={clickSoundIcon}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || currentVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="absolute bottom-full  left-1/2 -translate-x-1/2 w-6 h-28 hidden group-hover:flex items-center justify-center rounded-md bg-neutral-800 bg-opacity-90 shadow-lg py-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : currentVolume}
            onChange={handleVolumeChange}
            className="w-20 rotate-[-90deg] accent-green-500 cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </div>

      <button onClick={toggleQueueVisibility} className="text-gray-400 hover:text-white focus:outline-none" aria-label="View Queue">
        <ListMusic className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* Modals */}
  {isAddToPlaylistModalOpen && currentSong && (
    <AddToPlaylistForm song={currentSong} onClose={closeAddToPlaylistModal} />
  )}
  {isQueueVisible && <QueueSong onClose={toggleQueueVisibility} />}
</div>

    );
};

export default Player;