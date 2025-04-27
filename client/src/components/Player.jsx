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
import AddToPlaylistForm from "./Playlist/AddToPlaylistForm"; // Import Playlist component
import QueueSong from "../components/QueueSong"; // Import QueueSong component

const Player = ({ onOpenPlaylistModal }) => {
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
    const [hasLoadedCurrentSong, setHasLoadedCurrentSong] = useState(false); // Theo dõi xem bài hát hiện tại đã được load metadata chưa

    useEffect(() => {
      if (!currentSong) {
          // ... (Xử lý khi không có bài hát)
          setHasLoadedCurrentSong(false); // Thêm dòng này nếu cần
          return;
      }
      const audio = audioRef.current;
  
      // Chỉ load lại khi URL bài hát thực sự thay đổi
      // So sánh URL hiện tại của audio với URL mới
      if (audio.currentSrc !== currentSong.audioUrl) {
        console.log("Song changed, reloading audio source");
        audio.src = currentSong.audioUrl; // Cập nhật src
        audio.load(); // Chỉ load khi bài hát thay đổi
        setCurrentTime(0); // Reset thời gian về 0 cho bài mới
        setHasLoadedCurrentSong(false); // Reset trạng thái load
      } else if (!hasLoadedCurrentSong) {
          // Nếu cùng bài hát nhưng chưa load xong metadata (ví dụ: refresh trang)
          // Có thể cần gọi lại load nếu trạng thái audio không ổn định
          // audio.load(); // Cân nhắc nếu cần thiết
      }
  
  
      const onLoadedMetadata = () => {
          console.log("Metadata loaded, duration:", audio.duration);
          setDuration(audio.duration);
          setHasLoadedCurrentSong(true);
          // Quyết định play dựa trên state isPlaying hiện tại
          if (isPlaying) {
               audio.play().catch((err) => console.error("Autoplay failed on load:", err));
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
  
      // Gắn listener
      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);
  
      // Cleanup listeners
      return () => {
          audio.removeEventListener("loadedmetadata", onLoadedMetadata);
          audio.removeEventListener("timeupdate", onTimeUpdate);
          audio.removeEventListener("ended", onEnded);
      };
      // Chỉ phụ thuộc vào currentSong, isRepeat, nextSong
  }, [currentSong, isRepeat, nextSong]); // <--- Xóa isPlaying khỏi đây
  
  // Thêm một useEffect riêng để xử lý play/pause khi isPlaying thay đổi
  useEffect(() => {
      const audio = audioRef.current;
      if (!audio || !currentSong || !hasLoadedCurrentSong) return; // Đảm bảo audio đã sẵn sàng
  
      if (isPlaying) {
          audio.play().catch(err => console.error("Error playing:", err));
      } else {
          audio.pause();
      }
  }, [isPlaying, hasLoadedCurrentSong, currentSong]); // Chạy khi isPlaying hoặc trạng thái load thay đổi

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

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [togglePlay]);

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
            <div className="fixed bottom-0 left-0 w-full h-20 bg-black text-white flex items-center justify-center px-5 md:px-10 lg:px-20 gap-4 z-50 shadow-md">
                <p>No selected song.</p>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full h-auto lg:h-30 bg-black text-white flex items-center justify-between px-5 md:px-10 lg:px-20 gap-4 z-50 shadow-md">
            <div className="flex items-center justify-between gap-4 w-full flex-col sm:flex-row">
                <audio ref={audioRef}>
                    <source src={currentSong.audioUrl} type="audio/mpeg" />
                </audio>

                <div className="flex items-center gap-4 md:flex-row flex-col mb-2 md:mb-0">
                    <img
                        src={currentSong.imageUrl}
                        alt={currentSong.title}
                        className="w-12 h-12 rounded-md shadow sm:w-16 sm:h-16"
                    />
                    <div className="flex flex-col items-start">
                        <p className="truncate font-semibold text-lg sm:text-xl">{currentSong.title}</p>
                        <p className="text-sm text-gray-400 truncate sm:text-base">{currentSong.artist}</p>
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

                <div className="flex items-center flex-col md:flex-row md:w-[60%] gap-y-2 md:gap-x-4">
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

                    <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0 mt-2 md:mt-0">
                        <span className="text-sm">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 rounded-full bg-gray-700 accent-green-500 cursor-pointer"
                        />
                        <span className="text-sm">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2 md:mt-0">
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
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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
                <AddToPlaylistForm song={currentSong} onClose={closeAddToPlaylistModal} />
            )}
            {/* Queue Modal */}
            {isQueueVisible && <QueueSong onClose={toggleQueueVisibility} />}
        </div>
    );
};

export default Player;