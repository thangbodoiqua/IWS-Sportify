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
    const [users, setUsers] = useState(0); // State này hiện không dùng trong DashboardCard, nhưng vẫn giữ lại
    const navigate = useNavigate();
    const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
    const [isAddToAlbumModalOpen, setIsAddToAlbumModalOpen] = useState(false);
    const [currentSongForAlbum, setCurrentSongForAlbum] = useState(null);

    const fetchDashboardData = async () => {
        try {
            // Fetch songs và albums cùng lúc
            const [songsResponse, albumsResponse] = await Promise.all([
                 axiosInstance.get('/api/song'), // API lấy danh sách bài hát
                 axiosInstance.get('/api/album'), // API lấy danh sách album
                // Nếu cần totalUsers, bạn vẫn gọi API user ở đây
                // axiosInstance.get('/api/user')
            ]);
            const songsData = songsResponse.data;
            // Giả định API /api/album trả về object { success: true, albums: [...] }
            const albumsData = albumsResponse.data.albums;
             // Nếu có gọi API user: const usersData = usersRespon.data;

            // Kiểm tra xem dữ liệu trả về có phải mảng không trước khi set state
            setSongs(Array.isArray(songsData) ? songsData : []);
            setAlbums(Array.isArray(albumsData) ? albumsData : []);
            // Nếu có user data: setUsers(usersData.totalUsers || 0);

        } catch (error) {
            console.error('API Error (dashboard):', error);
            // Xử lý lỗi: có thể hiển thị thông báo hoặc set state rỗng
             setSongs([]);
             setAlbums([]);
             setUsers(0); // Reset user count on error
        }
    };

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchDashboardData();
    }, []); // Empty dependency array: run only once on mount

    const handleBackToSongList = () => {
        navigate('/'); // Sử dụng navigate để quay về trang chủ
    };

    // Các hàm xử lý sau khi xóa, thêm, cập nhật
    const handleSongDeleted = (deletedSongId) => {
        // Cập nhật state songs sau khi xóa thành công một bài hát
        setSongs(prevSongs => prevSongs.filter(song => song._id !== deletedSongId));
        // Không cần fetch lại toàn bộ data nếu chỉ muốn cập nhật state Songs
        // Tuy nhiên, nếu việc xóa bài hát ảnh hưởng đến Album (bài đó có trong album nào đó),
        // bạn có thể cần fetch lại Albums hoặc cập nhật state Albums một cách thông minh hơn.
    };

    const handleAlbumDeleted = (deletedAlbumId) => {
        // Cập nhật state albums sau khi xóa thành công một album
        setAlbums(prevAlbums => prevAlbums.filter(album => album._id !== deletedAlbumId));
         // Nếu việc xóa album ảnh hưởng đến state Songs (ví dụ: bài hát bị xóa theo album),
         // bạn có thể cần fetch lại Songs hoặc cập nhật state Songs.
    };

    const handleAlbumCreated = () => {
        // Đóng modal và fetch lại toàn bộ data để cập nhật danh sách album
        setIsAddAlbumModalOpen(false);
        fetchDashboardData(); // Fetch lại cả songs và albums để đảm bảo đồng bộ
    };

    const handleOpenAddAlbumModal = () => {
        setIsAddAlbumModalOpen(true);
    };

    const handleCloseAddAlbumModal = () => {
        setIsAddAlbumModalOpen(false);
    };

    const handleSongCreated = () => {
        // Đóng modal và fetch lại toàn bộ data để cập nhật danh sách bài hát
        setIsAddSongModalOpen(false);
        fetchDashboardData(); // Fetch lại cả songs và albums
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
        // Đóng modal sau khi thêm bài hát vào album thành công
        setIsAddToAlbumModalOpen(false);
        // Gọi lại fetchDashboardData để cập nhật thông tin album hiển thị ngay lập tức
        // (vì việc thêm bài hát có thể làm thay đổi thông tin trong AlbumTable, ví dụ: số lượng bài)
        fetchDashboardData();
    };

     // Hàm này được gọi từ AlbumTable khi có album được cập nhật (ví dụ: xóa bài hát khỏi album)
    const handleAlbumUpdated = () => {
        // Fetch lại toàn bộ data để cập nhật danh sách album (và có thể cả songs nếu cần)
        fetchDashboardData();
    };


    return (
        <>
            <Navbar onHomeClick={handleBackToSongList} />
            <div className="p-6 bg-[#111] min-h-screen text-white">
                <h1 className="text-3xl font-bold mb-2">Music Manager</h1>
                <p className="text-gray-400 mb-6">Manage your music catalog</p>

                {/* Thống kê tổng quan */}
                {/* Đã căn giữa các card */}
                <div className="flex w-ful justify-center mb-4 gap-4">
                    <DashboardCard icon={<span>🎵</span>} label="Total Songs" value={songs.length} />
                    <DashboardCard icon={<span>📁</span>} label="Total Albums" value={albums.length} />
                     {/* Nếu bạn fetch users count, hiển thị nó ở đây */}
                    {/* <DashboardCard icon={<span>👥</span>} label="Total Users" value={users} /> */}
                </div>

                {/* Chuyển đổi tab - Cần thêm cursor-pointer bên trong component TabSwitcher */}
                <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Songs Tab */}
                {activeTab === 'Songs' && (
                    <>
                        <div className=" flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Songs Library</h2>
                            <button
                                onClick={handleOpenAddSongModal}
                                // Đã thêm class cursor-pointer
                                className="cursor-pointer bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                aria-label="Add new song" // Thêm aria-label cho accessibility
                            >
                                <FiPlus className="inline-block mr-2" /> Add Song
                            </button>
                        </div>
                        {/* SongTable - Cần thêm cursor-pointer bên trong component SongTable cho các nút/dòng tương tác */}
                        <SongTable
                            songs={songs}
                            onSongDeleted={handleSongDeleted}
                            onAddToAlbum={handleOpenAddToAlbumModal} // Truyền hàm mở modal thêm vào album
                        />
                    </>
                )}

                {/* Albums Tab */}
                {activeTab === 'Albums' && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Albums Library</h2>
                            <button
                                onClick={handleOpenAddAlbumModal}
                                // Đã thêm class cursor-pointer
                                className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                aria-label="Add new album" // Thêm aria-label cho accessibility
                            >
                                <FiPlus className="inline-block mr-2" /> Add Album
                            </button>
                        </div>
                         {/* AlbumTable - Cần thêm cursor-pointer bên trong component AlbumTable cho các nút/dòng tương tác */}
                        <AlbumTable
                            albums={albums}
                            allSongs={songs} // Truyền toàn bộ danh sách bài hát cho AlbumTable nếu cần hiển thị bài trong album
                            onAlbumDeleted={handleAlbumDeleted}
                            onAlbumUpdated={handleAlbumUpdated} // Truyền hàm xử lý khi album được cập nhật (ví dụ: xóa bài khỏi album)
                        />
                    </>
                )}

                {/* Modal thêm album */}
                {isAddAlbumModalOpen && (
                    <AddAlbumForm
                        onCancel={handleCloseAddAlbumModal} // Cần thêm cursor-pointer vào nút hủy/đóng bên trong AddAlbumForm
                        onAlbumCreated={handleAlbumCreated}
                    />
                )}

                {/* Modal thêm bài hát */}
                {isAddSongModalOpen && (
                    <AddSongForm
                        onCancel={handleCloseAddSongModal} // Cần thêm cursor-pointer vào nút hủy/đóng bên trong AddSongForm
                        onSongCreated={handleSongCreated}
                        albums={albums} 
                    />
                )}

                {/* Modal thêm bài hát vào album */}
                {isAddToAlbumModalOpen && currentSongForAlbum && (
                    <AddToAlbumModal
                        song={currentSongForAlbum}
                        albums={albums} // Truyền danh sách album cho modal
                        onClose={handleCloseAddToAlbumModal} // Cần thêm cursor-pointer vào nút đóng bên trong AddToAlbumModal
                        onAddToAlbumConfirmed={handleAddToAlbumConfirmed} // Xử lý sau khi thêm thành công
                    />
                )}
            </div>
        </>
    );
};

export default AdminDashboard;