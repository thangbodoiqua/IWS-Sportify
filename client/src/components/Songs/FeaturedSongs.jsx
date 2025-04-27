import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'; // Thêm useCallback
import { AppContext } from '../../context/AppContext';
import { FaPlay } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import SongOptions from './SongOptions'; // Import component SongOptions

const FeaturedSongs = ({ onOpenPlaylistModal }) => {
    const { value } = useContext(AppContext);
    const { backendUrl, setCurrentSong, addToQueue, setIsPlaying } = value;
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [optionsVisible, setOptionsVisible] = useState(null);
    const [isHoveringContainer, setIsHoveringContainer] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [hoveredSongId, setHoveredSongId] = useState(null);

    useEffect(() => {
        const fetchFeaturedSongs = async () => {
            setLoading(true); // Bắt đầu loading
            try {
                const res = await fetch(`${backendUrl}/api/song/featured`);
                if (!res.ok) {
                   throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setSongs(data || []); // Đảm bảo songs là array
            } catch (err) {
                console.error('Failed to fetch featured songs:', err);
                setSongs([]); // Set thành mảng rỗng nếu lỗi
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };
        fetchFeaturedSongs();
    }, [backendUrl]);

    // Sử dụng useCallback để tránh tạo lại hàm checkScrollability mỗi lần render
    const checkScrollability = useCallback(() => {
        const container = scrollRef.current;
        if (container) {
            const hasHorizontalScrollbar = container.scrollWidth > container.clientWidth;
            // Thêm một khoảng đệm nhỏ (ví dụ 1 pixel) để xử lý sai số float
            const tolerance = 1;
            setCanScrollLeft(container.scrollLeft > tolerance);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - tolerance);
            // Nếu không có scrollbar thì không thể scroll cả 2 chiều
            if (!hasHorizontalScrollbar) {
                 setCanScrollLeft(false);
                 setCanScrollRight(false);
            }
        } else {
            setCanScrollLeft(false);
            setCanScrollRight(false);
        }
    }, []); // Callback này không có dependency vì nó chỉ đọc từ ref

    useEffect(() => {
        const container = scrollRef.current;
        // Chỉ chạy khi không loading và container đã tồn tại
        if (container && !loading) {
            // Thêm listener cho sự kiện scroll
            container.addEventListener('scroll', checkScrollability, { passive: true }); // passive=true nếu không preventDefault

            // Sử dụng ResizeObserver để theo dõi thay đổi kích thước container
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(container);

            // Kiểm tra trạng thái scroll ngay sau khi data load xong và render
            // Dùng setTimeout để đảm bảo DOM đã cập nhật hoàn toàn
            const timerId = setTimeout(checkScrollability, 50); // Delay nhỏ

            // Cleanup function
            return () => {
                container.removeEventListener('scroll', checkScrollability);
                resizeObserver.unobserve(container);
                clearTimeout(timerId); // Xóa timeout nếu component unmount trước khi nó chạy
            };
        } else {
            // Reset khi đang loading hoặc không có container
            setCanScrollLeft(false);
            setCanScrollRight(false);
        }
    // Phụ thuộc vào loading và hàm checkScrollability
    // Thêm songs vào dependency nếu cấu trúc songs thay đổi có thể ảnh hưởng đến scrollWidth
    }, [loading, checkScrollability, songs]);

    const scroll = (direction) => {
        const container = scrollRef.current;
        // Tính toán khoảng cách scroll hợp lý hơn (ví dụ: 2 card)
        const scrollAmount = container ? (container.clientWidth / 2) : 300; // Scroll nửa chiều rộng container
        if (container) {
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            // Sau khi scroll xong bằng nút, kiểm tra lại trạng thái scroll
            // Do scrollBy là không đồng bộ, dùng setTimeout để đợi scroll kết thúc
            setTimeout(checkScrollability, 350); // Delay ước tính cho animation 'smooth'
        }
    };

    const handleSongSelect = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const handleAddToQueue = (song) => {
        if (addToQueue) {
            addToQueue(song);
        } else {
            console.warn('Hàm addToQueue không được định nghĩa trong AppContext');
        }
    };

    const toggleOptions = (e, songId) => {
        e.stopPropagation();
        setOptionsVisible(optionsVisible === songId ? null : songId);
    };

    const closeOptions = () => {
        setOptionsVisible(null);
    };

    // Tách hàm xử lý hover để gọi checkScrollability khi hover vào
    const handleMouseEnterContainer = () => {
        setIsHoveringContainer(true);
        checkScrollability(); // Kiểm tra lại trạng thái khi hover vào
    }

    return loading ? (
        <div className="flex items-center justify-center p-3 text-white h-[240px]">Loading featured songs...</div> // Đặt chiều cao cố định
    ) : (
        <div
            className="relative p-3 h-[240px] w-full max-w-[calc(100vw - 48px)] md:max-w-[850px] mx-auto" // Căn giữa và giới hạn chiều rộng tối đa
            onMouseEnter={handleMouseEnterContainer} // Sử dụng hàm mới
            onMouseLeave={() => setIsHoveringContainer(false)}
        >
            <h2 className="text-xl font-semibold text-white mb-2">Featured Songs</h2>

            {/* Nút Scroll Left */}
            {isHoveringContainer && canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="cursor-pointer absolute left-[-8px] md:left-[-15px] top-[calc(50%_+_10px)] transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100" // Điều chỉnh vị trí và style
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}

            {/* Container chứa bài hát */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2" // Thêm padding bottom nếu cần
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {songs.map((song) => (
                    <div
                        key={song._id}
                        className="cursor-pointer min-w-[160px] max-w-[160px] h-[200px] bg-[#181818] hover:bg-[#282828] rounded-lg overflow-hidden shadow-lg flex-shrink-0 relative group transition-colors duration-200 flex flex-col" // Thay đổi màu nền và hover
                        onClick={() => handleSongSelect(song)}
                        onMouseEnter={() => setHoveredSongId(song._id)}
                        onMouseLeave={() => setHoveredSongId(null)}
                    >
                        <div className="relative w-full h-[115px] overflow-hidden rounded-t-lg"> {/* Bo tròn theo card */}
                            <img
                                src={song.imageUrl}
                                alt={song.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Chỉnh sửa transition
                            />
                            {/* Nút Play hiện khi hover */}
                            <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSongSelect(song); }} // Ngăn chặn event nổi lên card và play ngay
                                    className="bg-green-500 hover:bg-green-400 rounded-full p-3 shadow-lg focus:outline-none" // Tăng kích thước padding
                                    aria-label={`Play ${song.title}`}
                                >
                                    <FaPlay className="text-black text-sm" /> {/* Giảm kích thước icon */}
                                </button>
                            </div>
                            {/* Nút More Options hiện khi hover */}
                            {hoveredSongId === song._id && (
                                <div className="absolute top-2 right-2 z-20"> {/* Tăng z-index */}
                                    <button
                                        onClick={(e) => toggleOptions(e, song._id)}
                                        className="cursor-pointer bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-1 text-white focus:outline-none transition-opacity"
                                        aria-label={`More options for ${song.title}`}
                                    >
                                        <FiMoreVertical className="w-4 h-4" />
                                    </button>
                                    {optionsVisible === song._id && (
                                        <SongOptions
                                            song={song}
                                            onClose={closeOptions}
                                            onAddToQueue={handleAddToQueue}
                                            onOpenPlaylistModal={onOpenPlaylistModal}
                                            // Thêm style để định vị menu options nếu cần
                                            // className="absolute right-0 top-full mt-1 z-30"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-3 flex flex-col flex-grow overflow-hidden"> {/* Đảm bảo text không tràn */}
                            <h3 className="text-sm font-semibold text-white truncate whitespace-nowrap">{song.title}</h3>
                            <p className="text-xs text-gray-400 truncate whitespace-nowrap">{song.artist}</p>
                        </div>
                    </div>
                ))}
                 {/* Thêm một phần tử trống để đảm bảo có thể scroll hết card cuối cùng */}
                <div className="min-w-[1px] flex-shrink-0"></div>
            </div>

             {/* Nút Scroll Right */}
            {isHoveringContainer && canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                     className="cursor-pointer absolute right-[-8px] md:right-[-15px] top-[calc(50%_+_10px)] transform -translate-y-1/2 z-20 bg-gray-800 text-white p-2 md:p-3 rounded-full shadow-md transition-all duration-200 hover:bg-gray-600 hover:scale-105 opacity-80 hover:opacity-100" // Điều chỉnh vị trí và style
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default FeaturedSongs;