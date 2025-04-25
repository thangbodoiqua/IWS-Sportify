import React, { useState, useEffect, useContext, useRef } from "react";
import { assets } from "../assets/resources/assets";
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import PlaylistForm from './PlaylistForm';

const SideBar = ({ onPlaylistSelect }) => {
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const { isLoggedIn, playlists, fetchPlaylists } = useContext(AppContext).value;
    const playlistListRef = useRef(null);

    useEffect(() => {
        if (playlistListRef.current) {
            const shouldScroll = playlistListRef.current.scrollHeight > playlistListRef.current.clientHeight;
            playlistListRef.current.style.overflowY = shouldScroll ? 'auto' : 'hidden';
        }
    }, [playlists]); // Theo dõi sự thay đổi của playlists

    const handlePlaylistClick = (playlist) => {
        if (onPlaylistSelect) {
            onPlaylistSelect(playlist);
        } else {
            console.warn("onPlaylistSelect prop is missing in SideBar");
        }
    };

    return (
        <div className=" p-2 flex flex-col gap-2 text-white lg:flex">
            <div className=" rounded">
                {/* Header "Your Library" và nút "+" */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={assets.stack_icon} alt="" className="w-8" />
                        <p className="font-semibold">Your Library</p>
                    </div>
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                            if (isLoggedIn) {
                                setIsCreatingPlaylist(!isCreatingPlaylist);
                            } else {
                                toast.error("Please log in to create a playlist.");
                            }
                        }}
                    >
                        <img src={assets.plus_icon} alt="Add Playlist" className="w-5" />
                    </div>
                </div>

                {/* Container cho danh sách playlist và form */}
                <div
                    ref={playlistListRef}
                    className="px-2"
                    style={{ maxHeight: 'calc(85vh - 150px)', overflowY: 'hidden' }}
                >
                    {/* Form tạo playlist */}
                    {isCreatingPlaylist && (
                        <PlaylistForm
                            onCancel={() => setIsCreatingPlaylist(false)}
                            onPlaylistCreated={(newPlaylist) => {
                                // Không cần cập nhật state cục bộ ở đây
                                fetchPlaylists(); // Gọi để fetch lại danh sách mới nhất
                                setIsCreatingPlaylist(false);
                            }}
                        />
                    )}

                    {/* Danh sách playlists từ AppContext */}
                    {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <div
                                key={playlist._id}
                                className="p-2 mb-1 rounded font-semibold flex items-center gap-3 pl-4 hover:bg-[#2a2a2a] cursor-pointer"
                                onClick={() => handlePlaylistClick(playlist)}
                            >
                                <img
                                    src={playlist.coverImageUrl || assets.soundIMG}
                                    alt={playlist.name}
                                    className="w-8 h-8 rounded object-cover"
                                />
                                <span className="truncate">{playlist.name}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start gap-1 pl-4">
                            <h1>Create your first playlist</h1>
                            <button
                                className="cursor-pointer px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4"
                                onClick={() => {
                                    if (isLoggedIn) {
                                        setIsCreatingPlaylist(true);
                                    } else {
                                        toast.error("Please log in to create a playlist.");
                                    }
                                }}
                            >
                                Create Playlist
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideBar;