import React, { useRef, useState, useEffect, useContext } from 'react';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Repeat,
    Volume2,
    VolumeX,
    Plus // Import icon Plus
} from 'lucide-react';
import { AppContext } from '../context/AppContext'; // Import AppContext

const Player = ({ song: currentSong, onOpenPlaylistModal }) => { // Nhận onOpenPlaylistModal từ props
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(1);
    const [isRepeat, setIsRepeat] = useState(false);
    const { value } = useContext(AppContext); // Sử dụng AppContext

    useEffect(() => {
        // ... (phần useEffect giữ nguyên)
    }, [currentSong, isRepeat]);

    useEffect(() => {
        // ... (phần useEffect xử lý repeat khi kết thúc bài hát giữ nguyên)
    }, [isRepeat, isPlaying, currentTime, duration, currentSong]);

    const togglePlay = () => {
        // ... (phần togglePlay giữ nguyên)
    };

    const handleSeek = (e) => {
        // ... (phần handleSeek giữ nguyên)
    };

    const handleVolumeChange = (e) => {
        // ... (phần handleVolumeChange giữ nguyên)
    };

    const clickSoundIcon = () => {
        // ... (phần clickSoundIcon giữ nguyên)
    };

    const formatTime = (secs) => {
        // ... (phần formatTime giữ nguyên)
    };

    useEffect(() => {
        // ... (phần useEffect xử lý phím space giữ nguyên)
    }, [togglePlay]);

    if (!currentSong) {
        // ... (phần hiển thị khi không có bài hát được chọn giữ nguyên)
        return (
            <div className="fixed bottom-0 left-0 w-full h-24 bg-gray-900 text-white flex items-center justify-center px-20 gap-4 z-50 shadow-md">
                <p>No song selected.</p>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full h-24 bg-gray-900 text-white flex items-center justify-between px-20 gap-4 z-50 shadow-md">
            <div className="flex items-center justify-between gap-4 w-full">
                <audio ref={audioRef}>
                    <source src={currentSong.audioUrl} type="audio/mpeg" />
                </audio>

                <div className="flex gap-4">
                    <img
                        src={currentSong.imageUrl}
                        alt={currentSong.title}
                        className="w-16 h-16 rounded-md shadow"
                    />
                    <div className="flex flex-col">
                        <p className="truncate font-semibold text-lg">{currentSong.title}</p>
                        <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
                    </div>
                </div>

                <div className="w-[60%] flex items-center">
                    {/* ... (các nút điều khiển nhạc giữ nguyên) */}
                </div>

                <div className="flex items-center gap-4">
                    {/* ... (các nút repeat, volume giữ nguyên) */}

                    {/* Add to Playlist Icon */}
                    <button
                        onClick={() => onOpenPlaylistModal(currentSong)} // Sử dụng hàm từ props
                        className="text-gray-400 hover:text-white focus:outline-none"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Player;