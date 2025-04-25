import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../AxiosInstance"; // Import AxiosInstance

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [playlists, setPlaylists] = useState([]); // State for playlists
  const [queue, setQueue] = useState([]); // State for the song queue
  const [queueIndex, setQueueIndex] = useState(0); // Index of the currently playing song in the queue
  const [playedSongs, setPlayedSongs] = useState([]); // State for played songs history
  const [currentAlbum ,setCurrentAlbum] = useState(null)

  const getAuthState = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${backendUrl}/api/auth/is-auth`
      );
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
        fetchPlaylists(); // Call fetchPlaylists after login
      } else {
        setIsLoggedIn(false);
        setPlaylists([]); // Reset playlists when not logged in
      }
    } catch (error) {
      toast.error(error.message);
      setIsLoggedIn(false);
      setPlaylists([]); // Reset playlists on error
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

  const fetchPlaylists = async () => {
    try {
      const response = await axiosInstance.get("/api/playlist");
      setPlaylists(response.data.playlists || []);
      console.log("Playlists fetched in AppContext:", response.data.playlists);
    } catch (err) {
      toast.error("Failed to fetch playlists.");
      console.error("Failed to fetch playlists in AppContext:", err);
      setPlaylists([]);
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
        // Cập nhật lại danh sách playlists sau khi thêm bài hát thành công
        fetchPlaylists();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add song to playlist.";
      toast.error(message);
      console.error("Error adding song to playlist:", error);
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

  const playPlaylist = (songs) => {
      setQueue([]); // Xóa queue hiện tại
      setQueueIndex(0); // Reset queue index
      setQueue(songs); // Thêm tất cả các bài hát từ playlist vào queue
      setPlayedSongs([]); // Xóa lịch sử phát
    
      if (songs.length > 0) {
       setCurrentSong(songs[0]); // Bắt đầu phát bài hát đầu tiên
       toast.info(`Playing playlist. Starting with "${songs[0].title}".`);
      } else {
       setCurrentSong(null);
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
    playlists,
    setPlaylists, 
    fetchPlaylists,
    filterPlaylistsContainingSong,
    addSongToPlaylist, 
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
    setCurrentAlbum // Share played songs history
  };

  return (
    <AppContext.Provider value={{ value }}>
      {props.children}
    </AppContext.Provider>
  );
};
