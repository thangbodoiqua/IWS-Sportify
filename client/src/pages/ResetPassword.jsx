import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IoArrowBackOutline } from 'react-icons/io5'; // Import icon mũi tên từ react-icons

const ResetPassword = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // axios.defaults.withCredential = true; // This might cause issues depending on your backend setup and CORS. Consider removing or configuring properly.

    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isEmailSent, setIsEmailSent] = useState(false) // Initialize as boolean
    const [otp, setOtp] = useState('') // Initialize as string to handle concatenation later
    const [isOtpSubmited, setisOtpSubmited] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track submit status
    const inputRefs = React.useRef([]);

    // Function to handle input in OTP fields and move focus
    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Function to handle backspace in OTP fields and move focus
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Function to handle pasting into OTP fields
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
        // Optional: Focus the last filled input or the next empty one
        if (pasteArray.length > 0 && inputRefs.current[pasteArray.length - 1]) {
             inputRefs.current[Math.min(pasteArray.length, inputRefs.current.length - 1)].focus();
        }
    };


    // Handler for submitting email to send OTP
    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start submitting state

        try {
            const { data } = await axios.post('http://localhost:4000' + '/api/auth/send-reset-otp', { email })
            if (data.success) {
                toast.success(data.message);
                setIsEmailSent(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false); // End submitting state
        }
    }

    // Handler for submitting OTP
    const onSubmitOTP = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start submitting state

        const otpArray = inputRefs.current.map(input => input ? input.value : '').filter(value => value !== ''); // Get values and filter out null/undefined refs
        const enteredOtp = otpArray.join('');
        setOtp(enteredOtp);

        // Basic validation: check if 6 digits are entered
        if (enteredOtp.length === 6) {
             // You might want to add an API call here to verify the OTP before setting isOtpSubmited
             // For now, we'll just proceed if 6 digits are entered
             setisOtpSubmited(true);
             toast.info("OTP submitted. Please enter your new password."); // Inform user
             setIsSubmitting(false); // End submitting state if validation passes locally
        } else {
             toast.error("Please enter the complete 6-digit OTP.");
             setIsSubmitting(false); // End submitting state if validation fails
        }
         // Note: If you add an API call here, move setIsSubmitting(false) to the try/catch/finally of the API call
    }


    // Handler for submitting the new password
    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start submitting state

        try {
            // Ensure OTP state is updated before sending (though onSubmitOTP handles this)
            // You might want to re-verify OTP on the backend here as well for security
            const { data } = await axios.post('http://localhost:4000' + '/api/auth/reset-password', { email, otp, newPassword })
            if (data.success) {
                toast.success(data.message);
                navigate('/login'); // Navigate on success
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false); // End submitting state
        }
    }

     // Inline style for the loading spinner
     const loaderStyle = {
        width: '20px',
        height: '20px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    };

    // CSS keyframes for the spin animation
    const spinAnimation = `@keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`;


    return (
        // Main container with dark background gradient
        <div className='flex items-center justify-center min-h-screen sm:px-0 px-6 bg-gradient-to-br from-gray-900 to-black relative'> {/* Use dark gradient */}

            {/* Back arrow icon for Login navigation */}
            <svg
                onClick={() => navigate('/login')} // Navigate back to Login
                className='absolute left-4 sm:left-8 top-5 text-gray-400 hover:text-white cursor-pointer w-6 h-6 z-10' // Styled as an icon, added z-index
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>

            {/* Logo (optional, removed as per previous request but kept for reference if needed) */}
            {/* <img onClick={() => navigate('/')} src={assets.logo} alt='Logo'
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer z-10' /> */}


            {/* Form container with dark background */}
            {!isEmailSent ? (
                // Email submission form
                <form onSubmit={onSubmitEmail} className='bg-[#1e1e1e] p-8 rounded-lg shadow-lg w-full sm:w-96 text-sm mt-12 relative text-gray-300'> {/* Use dark background, added text color */}
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
                    <p className='text-center mb-6 text-gray-400'>Enter your registered email address</p> {/* Adjusted text color */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#2c2c2c]'> {/* Use dark input background */}
                        <img src={assets.mail_icon} alt='Mail icon' className='w-3 h-3' />
                        <input
                            type='email'
                            placeholder='Email id'
                            className='bg-transparent outline-none text-gray-300 placeholder-gray-500 w-full' // Adjusted text and placeholder color, added w-full
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <button
                         type='submit'
                         className={`w-full  cursor-pointer py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full mt-3 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`} // Use dark button gradient, add loading styles
                         disabled={isSubmitting}
                    >
                         {isSubmitting ? (
                             <div style={loaderStyle}></div>
                         ) : (
                             'Submit'
                         )}
                    </button>
                </form>
            ) : !isOtpSubmited ? (
                // OTP submission form
                <form onSubmit={onSubmitOTP} className='bg-[#1e1e1e] p-8 rounded-lg shadow-lg w-full sm:w-96 text-sm mt-12 relative text-gray-300'> {/* Use dark background, added text color */}
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
                    <p className='text-center mb-6 text-gray-400'>Enter the 6-digit code sent to your email id.</p> {/* Adjusted text color */}
                    <div className='flex justify-between mb-8 gap-2' onPaste={handlePaste}> {/* Added gap */}
                        {Array(6)
                            .fill(0)
                            .map((_, index) => (
                                <input
                                    type='text'
                                    maxLength='1'
                                    key={index}
                                    required
                                    className='w-10 h-10 bg-[#2c2c2c] text-gray-300 text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-blue-500' // Use dark input background, adjusted size, added focus ring
                                    ref={(e) => (inputRefs.current[index] = e)}
                                    onInput={(e) => handleInput(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                            ))}
                    </div>
                    <button
                        type='submit'
                        className={`w-full cursor-pointer py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`} // Use dark button gradient, add loading styles
                        disabled={isSubmitting}
                    >
                         {isSubmitting ? (
                             <div style={loaderStyle}></div>
                         ) : (
                             'Submit'
                         )}
                    </button>
                </form>
            ) : (
                // New password submission form
                <form onSubmit={onSubmitNewPassword} className='bg-[#1e1e1e] p-8 rounded-lg shadow-lg w-full sm:w-96 text-sm mt-12 relative text-gray-300'> {/* Use dark background, added text color */}
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
                    <p className='text-center mb-6 text-gray-400'>Enter your new password</p> {/* Adjusted text color */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#2c2c2c]'> {/* Use dark input background */}
                        <img src={assets.lock_icon} alt='Lock icon' className='w-3 h-3' />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            className='bg-transparent outline-none text-gray-300 placeholder-gray-500 flex-grow' // Adjusted text and placeholder color
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                        
                    </div>
                    <button
                        type='submit'
                        className={`cursor-pointer w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full mt-3 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`} // Use dark button gradient, add loading styles
                        disabled={isSubmitting}
                    >
                         {isSubmitting ? (
                             <div style={loaderStyle}></div>
                         ) : (
                             'Submit'
                         )}
                    </button>
                </form>
            )}
             {/* Inline style for the spin animation keyframes */}
             <style>{spinAnimation}</style>
        </div>
    );
}

export default ResetPassword;
