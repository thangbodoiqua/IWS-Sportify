import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import Player from '../components/Player';
import { AppContext } from '../context/AppContext';
import PlaylistSong from '../components/PlaylistSong'; // Import PlaylistSong
import SongList from '../components/SongList'; // Import SongList
import Playlist from '../components/Playlist'; // Import Playlist

const Home = () => {
    const { currentSong } = useContext(AppContext).value;
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [windowHeight, setWindowHeight] = useState('100vh'); // Theo dõi chiều cao cửa sổ
    const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(`${window.innerHeight}px`);
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        // Hủy theo dõi sự kiện khi component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handlePlaylistSelect = (playlist) => {
        setSelectedPlaylist(playlist);
    };

    const handleBackToSongList = () => {
        setSelectedPlaylist(null);
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
        <div className="bg-[#242424] flex flex-col" style={{ height: windowHeight, overflow: 'hidden' }}> {/* Chiều cao cố định và ẩn cuộn */}
            <Navbar onHomeClick={handleBackToSongList} /> {/* Navbar ở trên cùng */}
            <div className='flex flex-grow overflow-hidden'> {/* Cho phép các phần tử con tự cuộn */}
                <div className='w-[27.5%] overflow-y-auto'> {/* Cho phép cuộn dọc cho SideBar */}
                    <SideBar onPlaylistSelect={handlePlaylistSelect} />
                </div>
                <div className='mt-0 flex-grow p-4 overflow-y-auto'> {/* Cho phép cuộn dọc cho nội dung chính */}
                    {selectedPlaylist ? (
                        <PlaylistSong playlist={selectedPlaylist} onBack={handleBackToSongList} />
                    ) : (
                        <SongList onOpenPlaylistModal={openPlaylistModal} /> 
                    )}
                </div>
            </div>
            {isPlaylistModalVisible && (
                <Playlist song={songToAdd} onClose={closePlaylistModal} /> 
            )}
            {currentSong && <Player onOpenPlaylistModal={openPlaylistModal} song={currentSong} />} {/* Truyền hàm mở modal */}
        </div>
    );
};

export default Home;