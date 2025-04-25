import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/admin/DashboardCard';
import TabSwitcher from '../components/admin/TabSwitcher';
import SongTable from '../components/admin/SongTable';
import AlbumTable from '../components/admin/AlbumTable';
import axiosInstance from '../AxiosInstance';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AddAlbumForm from '../components/admin/AddAlbumForm';
import AddSongForm from '../components/admin/AddSongForm';
import AddToAlbumModal from '../components/admin/AddToAlbumModal';
import { FiPlus } from 'react-icons/fi';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Songs');
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState(0);
    const navigate = useNavigate();
    const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
    const [isAddToAlbumModalOpen, setIsAddToAlbumModalOpen] = useState(false);
    const [currentSongForAlbum, setCurrentSongForAlbum] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const [songsResponse, albumsResponse, usersRespon] = await Promise.all([
                axiosInstance.get('/api/song'),
                axiosInstance.get('/api/album'),
                axiosInstance.get('/api/user') // Vẫn giữ lại để lấy artists và users
            ]);
            console.log("data fetched: " + songsResponse, albumsResponse, usersRespon)
            const songsData = songsResponse.data;
            const albumsData = albumsResponse.data.albums;
            const usersData = usersRespon.data;     
            console.log("data fetched: " + songsData, albumsData, usersData)
            setSongs(Array.isArray(songsData) ? songsData : []);
            setAlbums(Array.isArray(albumsData) ? albumsData : []);
            setUsers(usersData.totalUsers || 0);
    
        } catch (error) {
            console.error('API Error (dashboard):', error);
            // Xử lý lỗi, có thể hiển thị thông báo cho người dùng
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleBackToSongList = () => {
        navigate('/');
    };

    const handleSongDeleted = (deletedSongId) => {
        setSongs(prevSongs => prevSongs.filter(song => song._id !== deletedSongId));
    };

    const handleAlbumDeleted = (deletedAlbumId) => {
        setAlbums(prevAlbums => prevAlbums.filter(album => album._id !== deletedAlbumId));
    };

    const handleAlbumCreated = () => {
        setIsAddAlbumModalOpen(false);
        fetchDashboardData();
    };

    const handleOpenAddAlbumModal = () => {
        setIsAddAlbumModalOpen(true);
    };

    const handleCloseAddAlbumModal = () => {
        setIsAddAlbumModalOpen(false);
    };

    const handleSongCreated = () => {
        setIsAddSongModalOpen(false);
        fetchDashboardData();
    };

    const handleOpenAddSongModal = () => {
        setIsAddSongModalOpen(true);
    };

    const handleCloseAddSongModal = () => {
        setIsAddSongModalOpen(false);
    };

    const handleOpenAddToAlbumModal = (song) => {
        setCurrentSongForAlbum(song);
        setIsAddToAlbumModalOpen(true);
    };

    const handleCloseAddToAlbumModal = () => {
        setCurrentSongForAlbum(null);
        setIsAddToAlbumModalOpen(false);
    };

    const handleAddToAlbumConfirmed = () => {
        setIsAddToAlbumModalOpen(false);
        // Có thể gọi lại fetchDashboardData nếu bạn muốn cập nhật thông tin album hiển thị ngay lập tức
        fetchDashboardData();
    };

    const handleAlbumUpdated = (updatedAlbumId) => {
        // Gọi lại fetchDashboardData để cập nhật danh sách album
        fetchDashboardData();
    };

    return (
        <>
            <Navbar onHomeClick={handleBackToSongList} />
            <div className="p-6 bg-[#111] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-2">Music Manager</h1>
                <p className="text-gray-400 mb-6">Manage your music catalog</p>

                {/* Thống kê tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <DashboardCard icon={<span>🎵</span>} label="Total Songs" value={songs.length} />
                    <DashboardCard icon={<span>📁</span>} label="Total Albums" value={albums.length} />
                    <DashboardCard icon={<span>👤</span>} label="Total Artists" value={0} />
                    <DashboardCard icon={<span>👥</span>} label="Total Users" value={users} />
                </div>

                {/* Chuyển đổi tab */}
                <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Songs Tab */}
                {activeTab === 'Songs' && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Songs Library</h2>
                            <button
                                onClick={handleOpenAddSongModal}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                <FiPlus className="inline-block mr-2" /> Add Song
                            </button>
                        </div>
                        <SongTable songs={songs} onSongDeleted={handleSongDeleted} onAddToAlbum={handleOpenAddToAlbumModal} />
                    </>
                )}

                {/* Albums Tab */}
                {activeTab === 'Albums' && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Albums Library</h2>
                            <button
                                onClick={handleOpenAddAlbumModal}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                <FiPlus className="inline-block mr-2" /> Add Album
                            </button>
                        </div>
                        <AlbumTable albums={albums} allSongs={songs} onAlbumDeleted={handleAlbumDeleted} onAlbumUpdated={handleAlbumUpdated} /> {/* Truyền allSongs và onAlbumUpdated */}
                    </>
                )}

                {/* Modal thêm album */}
                {isAddAlbumModalOpen && (
                    <AddAlbumForm
                        onCancel={handleCloseAddAlbumModal}
                        onAlbumCreated={handleAlbumCreated}
                    />
                )}

                {/* Modal thêm bài hát */}
                {isAddSongModalOpen && (
                    <AddSongForm
                        onCancel={handleCloseAddSongModal}
                        onSongCreated={handleSongCreated}
                    />
                )}

                {/* Modal thêm bài hát vào album */}
                {isAddToAlbumModalOpen && currentSongForAlbum && (
                    <AddToAlbumModal
                        song={currentSongForAlbum}
                        albums={albums}
                        onClose={handleCloseAddToAlbumModal}
                        onAddToAlbumConfirmed={handleAddToAlbumConfirmed}
                    />
                )}
            </div>
        </>
    );
};

export default AdminDashboard;