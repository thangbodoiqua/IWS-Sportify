import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import Player from '../components/Player';
import { AppContext } from '../context/AppContext';
import PlaylistSong from '../components/PlaylistSong'; // Import PlaylistSong
import SongList from '../components/SongList'; // Import SongList

const Home = () => {
    const { currentSong } = useContext(AppContext).value;
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [windowHeight, setWindowHeight] = useState('100vh'); // Theo dõi chiều cao cửa sổ
    
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

    return (
        <div className="bg-[#242424] flex flex-col" style={{ height: windowHeight, overflow: 'hidden' }}> {/* Chiều cao cố định và ẩn cuộn */}
            <Navbar onHomeClick={handleBackToSongList} /> {/* Navbar ở trên cùng */}
            <div className='flex flex-grow overflow-hidden'> {/* Cho phép các phần tử con tự cuộn */}
                <div className='w-[35%] overflow-y-auto'> {/* Cho phép cuộn dọc cho SideBar */}
                    <SideBar onPlaylistSelect={handlePlaylistSelect} />
                </div>
                <div className='mt-0 flex-grow p-4 overflow-y-auto'> {/* Cho phép cuộn dọc cho nội dung chính */}
                    {selectedPlaylist ? (
                        <PlaylistSong playlist={selectedPlaylist} onBack={handleBackToSongList} />
                    ) : (
                        <SongList />
                    )}
                </div>
            </div>
            {currentSong && <Player song={currentSong} />}
        </div>
    );
};

export default Home;