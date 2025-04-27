  import { createContext, useState, useEffect,useCallback } from "react";
  import { toast } from "react-toastify";
  import axiosInstance from "../AxiosInstance"; // Import AxiosInstance
  import { useNavigate } from 'react-router-dom';

  export const AppContext = createContext();

  export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]); // State for the song queue
    const [queueIndex, setQueueIndex] = useState(0); // Index of the currently playing song in the queue
    const [playedSongs, setPlayedSongs] = useState([]); // State for played songs history
    const [currentAlbum ,setCurrentAlbum] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false); // Thêm state isPlaying

    const navigate = useNavigate();

    const logout = async () => {
      try {
          const { data } = await axiosInstance.post(backendUrl + "/api/auth/logout");;
          data.success && setIsLoggedIn(false);
          data.success && setUser(false);
          navigate('/login');
      } catch (error) {
          toast.error(error.message);
      }
    };
    
    const getAuthState = async () => {
      try {
        const { data } = await axiosInstance.get(
          `${backendUrl}/api/auth/is-auth`
        );
        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        toast.error(error.message);
        setIsLoggedIn(false);
      }
    };

    useEffect(() => {
      getAuthState();
    }, []);

    const getUserData = async () => {
      try {
        const { data } = await axiosInstance.get(`${backendUrl}/api/user/data`);
        data.success ? setUser(data.userData) : toast.error(data.message);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong";
        toast.error(message);
      }
    };


    const filterPlaylistsContainingSong = (song) => {
      if (!song) {
        return playlists;
      }
      return playlists.filter(
        (playlist) => !playlist.songs.some((s) => s._id === song._id)
      );
    };

    const addSongToPlaylist = async (playlistId, songId) => {
      try {
        const response = await axiosInstance.post("/api/playlist/add-song", {
          playlistId,
          songId,
        });
        if (response.data.success) {
          toast.success(response.data.message);
          // Cập nhật lại danh sách playlists một cách tối ưu
          setPlaylists(prevPlaylists =>
            prevPlaylists.map(playlist =>
              playlist._id === playlistId
                ? { ...playlist, songs: [...playlist.songs, { _id: songId }] } // Giả sử API trả về chỉ songId, nếu trả về object song bạn dùng object đó
                : playlist
            )
          );
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        // Xử lý lỗi
      }
    };

    // Queue functions
    const addToQueue = (song) => {
      const isAlreadyInQueue = queue.some(
        (queuedSong) => queuedSong._id === song._id
      );
      if (isAlreadyInQueue) {
        toast.warn(`"${song.title}" Already in queue.`);
        return;
      }

      setQueue((prevQueue) => [...prevQueue, song]);
      toast.success(`Added "${song.title}" into queue.`);

      if (queue.length === 0 && currentSong === null) {
        setCurrentSong(song);
        toast.info(`Playing "${song.title}".`);
      }
    };
    
    const playNow = (song) => {
      setQueue([song]);
      setQueueIndex(0);
      setCurrentSong(song);
      setPlayedSongs([]); // Clear history when playing directly
      toast.info(`Now playing "${song.title}".`);
    };

    const playPlaylist = (playlistSongs) => {
      setQueue([]); // Xóa queue hiện tại
      setQueueIndex(0); // Reset queue index
      setQueue(playlistSongs); // Thêm tất cả các bài hát từ playlist vào queue
      setPlayedSongs([]); // Xóa lịch sử phát

      if (playlistSongs.length > 0) {
          setCurrentSong(playlistSongs[0]); // Bắt đầu phát bài hát đầu tiên
          setIsPlaying(true); // Đảm bảo isPlaying được đặt thành true
          toast.info(`Playing playlist. Starting with "${playlistSongs[0].title}".`);
      } else {
          setCurrentSong(null);
          setIsPlaying(false); // Đảm bảo dừng phát nếu playlist rỗng
          toast.warn("Playlist is empty.");
      }
  };
    const playFromQueue = (index) => {
      if (index >= 0 && index < queue.length) {
        // Update played songs history
        if (currentSong) {
          setPlayedSongs((prevPlayed) => [...prevPlayed, currentSong]);
        }
        setCurrentSong(queue[index]);
        setQueueIndex(index);
      }
    };

    const nextSong = () => {
      if (queue.length > 0) {
        // Lấy bài hát hiện tại
        const current = queue[queueIndex];
        // Tạo queue mới bằng cách loại bỏ bài hát vừa phát
        const newQueue = queue.slice(queueIndex + 1);
        setQueue(newQueue);
        setQueueIndex(0); // Reset index về đầu queue mới

        // Cập nhật lịch sử bài hát đã phát
        if (current) {
          setPlayedSongs((prevPlayed) => [...prevPlayed, current]);
        }

        // Phát bài hát tiếp theo nếu có
        if (newQueue.length > 0) {
          setCurrentSong(newQueue[0]);
        } else {
          setCurrentSong(null);
        }
      }
    };

    const previousSong = () => {
      if (playedSongs.length > 0) {
        const lastPlayed = playedSongs[playedSongs.length - 1];
        const remainingPlayed = playedSongs.slice(0, -1);
        setPlayedSongs(remainingPlayed);

        // Đưa bài hát cuối cùng từ lịch sử lên đầu queue
        setQueue((prevQueue) => [lastPlayed, ...prevQueue]);
        setQueueIndex(0);
        setCurrentSong(lastPlayed);
      } else if (queueIndex > 0) {
        // Nếu không có lịch sử và không ở đầu queue, chỉ lùi lại 1 bài
        setQueueIndex((prevIndex) => prevIndex - 1);
        setCurrentSong(queue[queueIndex - 1]);
      }
    };

    const removeFromQueue = (index) => {
      const newQueue = queue.filter((_, i) => i !== index);
      setQueue(newQueue);
      if (index < queueIndex) {
        setQueueIndex((prevIndex) => prevIndex - 1);
      } else if (index === queueIndex && newQueue.length > 0) {
        setCurrentSong(newQueue[0]);
        setQueueIndex(0);
      } else if (newQueue.length === 0) {
        setCurrentSong(null);
        setQueueIndex(0);
      }
      toast.success("Removed song from queue.");
    };

    const clearQueue = () => {
      setQueue([]);
      setQueueIndex(0);
      setCurrentSong(null);
      toast.warn("Queue cleared.");
    };

    const value = {
      backendUrl,
      isLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      getUserData,
      currentSong,
      setCurrentSong,
      queue,
      addToQueue,
      playNow,
      playPlaylist, 
      queueIndex,
      playFromQueue,
      nextSong,
      previousSong,
      removeFromQueue,
      clearQueue,
      playedSongs,
      currentAlbum,
      setCurrentAlbum,
      logout,
      setIsPlaying,
      isPlaying // Share played songs history
    };

    return (
      <AppContext.Provider value={{ value }}>
        {props.children}
      </AppContext.Provider>
    );
  };
