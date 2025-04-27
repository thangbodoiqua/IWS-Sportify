import React, { useContext,useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../AxiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast
import Navbar from "../components/Navbar";
import { FiEdit, FiLock } from "react-icons/fi"; // Import icon chỉnh sửa và khóa
import { MdDelete } from "react-icons/md"; // Import icon xóa
import { AppContext } from "../context/AppContext";
function AccountPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstLetter, setFirstLetter] = useState("");
  const [showEditNameForm, setShowEditNameForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {isLoggedIn, setIsLoggedIn, logout} = useContext(AppContext).value;
  const navigate = useNavigate();

  const fetchAccountInfo = async () => {
    try {
      const response = await axiosInstance.get("/api/user/data");
      if (response.status >= 200 && response.status < 300) {
        const accountData = response.data.userData;
        setUsername(accountData.username);
        setEmail(accountData.email);
        setFirstLetter(accountData.username.charAt(0).toUpperCase());
        setNewUsername(accountData.username);
      } else {
        console.error(
          "Error loading account information:",
          response.status,
          response.statusText
        );
        toast.error("Could not load account information.");
      }
    } catch (error) {
      console.error("Connection error or other error:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const handleShowEditNameForm = () => {
    setShowEditNameForm(true);
    setShowResetPasswordForm(false);
    setShowDeleteConfirmation(false);
  };

  const handleCancelEditName = () => {
    setShowEditNameForm(false);
    setNewUsername(username);
  };

  const handleSubmitEditName = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.put("/api/user/update-username", {
        username: newUsername,
      });
      if (response.status >= 200 && response.status < 300) {
        setUsername(newUsername);
        setFirstLetter(newUsername.charAt(0).toUpperCase());
        setShowEditNameForm(false);
        toast.success("Username updated successfully!");
      } else {
        console.error(
          "Error updating username:",
          response.status,
          response.statusText
        );
        toast.error("Error updating username.");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("An error occurred while updating username.");
    }
  };

  const handleShowResetPasswordForm = () => {
    setShowResetPasswordForm(true);
    setShowEditNameForm(false);
    setShowDeleteConfirmation(false);
  };

  const handleCancelResetPassword = () => {
    setShowResetPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleSubmitResetPassword = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.put("/api/user/reset-password", {
        currentPassword,
        newPassword,
      });
      if (response.status >= 200 && response.status < 300) {
        setShowResetPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        toast.success("Password reset successfully!");
      } else {
        console.error(
          "Error resetting password:",
          response.status,
          response.statusText
        );
        toast.error("Error resetting password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred while resetting password.");
    }
  };

  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
    setShowEditNameForm(false);
    setShowResetPasswordForm(false);
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteConfirmation(false);
  };

  

  const handleConfirmDeleteAccount = async () => {
    try {
      const response = await axiosInstance.delete("/api/user/delete");
      await logout();
      if (response.status >= 200 && response.status < 300) {
        toast.success("Account deleted successfully!");
          navigate("/");
      } else {
        console.error(
          "Error deleting account:",
          response.status,
          response.statusText
        );
        toast.error("Error deleting account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting account.");
    }
  };

  return (
    <>
      <Navbar onHomeClick={() => navigate("/")} />
      <div className="bg-black min-h-screen text-white py-10">
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-md">
              {firstLetter}
              <div className="absolute inset-0 rounded-full shadow-inner"></div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">@{username}</h2>
          </div>

          <div className="bg-gray-900 rounded-md shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Account Information:</h3>
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-gray-400 mb-2">Email: {email}</label>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-gray-400 mb-2">
                Username: {username}
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleShowEditNameForm}
                  className="ml-2 text-blue-500 hover:text-blue-400 focus:outline-none cursor-pointer flex items-center"
                >
                  <FiEdit className="h-5 w-5 mr-1" /> Edit
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <label className="block text-gray-400 mb-2">
                Password: *************
              </label>
              <div className="flex items-center">
                <button
                  onClick={handleShowResetPasswordForm}
                  className="ml-2 text-green-500 hover:text-green-400 focus:outline-none cursor-pointer flex items-center"
                >
                  <FiLock className="h-5 w-5 mr-1" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Edit Name Form */}
          {showEditNameForm && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <form
                onSubmit={handleSubmitEditName}
                className="bg-gray-800 rounded-md shadow-md p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-semibold mb-4">Edit Username</h2>
                <div className="mb-4">
                  <label
                    htmlFor="newUsername"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    New Username:
                  </label>
                  <input
                    type="text"
                    id="newUsername"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEditName}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reset Password Form */}
          {showResetPasswordForm && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <form
                onSubmit={handleSubmitResetPassword}
                className="bg-gray-800 rounded-md shadow-md p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                <div className="mb-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Current Password:
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    New Password:
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelResetPassword}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8 bg-gray-900 rounded-md shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-500">
              Danger Zone
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Delete your account permanently.</p>
              <button
                onClick={handleShowDeleteConfirmation}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer flex items-center"
              >
                <MdDelete className="h-5 w-5 inline-block mr-1" /> Delete
              </button>
            </div>
          </div>

          {showDeleteConfirmation && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-gray-800 rounded-md shadow-md p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-red-500">
                  Confirm Delete
                </h2>
                <p className="text-gray-400 mb-4">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelDeleteAccount}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteAccount}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AccountPage;
