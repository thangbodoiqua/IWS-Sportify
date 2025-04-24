import axios from 'axios';

// Tạo instance của axios với baseURL và withCredentials
const axiosInstance = axios.create({
  baseURL:'http://localhost:4000', // Đặt base URL cho tất cả các request
  withCredentials: true, // Cho phép gửi cookie trong request (nếu cần)
});

export default axiosInstance;
