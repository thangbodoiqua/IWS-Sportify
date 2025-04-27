import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import axiosInstance from '../AxiosInstance';

const Login = () => {
    const navigate = useNavigate();
    // Assuming AppContext.value contains backendUrl, setIsLoggedIn, getUserData, isLoggedIn
    const { backendUrl, setIsLoggedIn, getUserData, isLoggedIn } = useContext(AppContext).value;
    const [state, setState] = useState('Sign up');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track submit status

    // Effect to log login status (can be removed in production)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Is Logged In:', isLoggedIn); // Added label for clarity
        }, 3000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    // Redirect if already logged in
    if (isLoggedIn) {
        navigate('/');
    }

    // Handler for form submission (Login or Sign up)
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setIsSubmitting(true); // Start submitting state

            let url = '';
            let payload = {};

            if (state === 'Sign up') {
                url = backendUrl + '/api/auth/register';
                payload = { name, email, password };
            } else { // state === 'Login'
                url = backendUrl + '/api/auth/login';
                payload = { email, password };
            }

            const { data } = await axiosInstance.post(url, payload);

            if (data.success) {
                if (state === 'Sign up') {
                    setState('Login'); // Switch to Login state after successful signup
                    clearForm();
                    toast.success(data.message);
                } else { // state === 'Login'
                    // Assuming the backend returns a token or sets a cookie on successful login
                    // You might need to store the token (e.g., in localStorage) and set isLoggedIn based on that.
                    // For this example, we'll just set isLoggedIn to true and fetch user data.
                    setIsLoggedIn(true);
                    getUserData(); // Fetch user data after successful login
                    toast.success(data.message);
                    navigate('/'); // Navigate to home page
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // Handle API errors
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false); // End submitting state regardless of success or failure
        }
    };

    // Function to clear form fields
    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
    };

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
        <div className=' flex items-center justify-center min-h-screen sm:px-0 px-6 bg-gradient-to-br from-gray-900 to-black'>
            {/* Back arrow icon for Home navigation */}
            <svg
                onClick={() => navigate('/')}
                className='absolute left-4 sm:left-8 top-5 text-gray-400 hover:text-white cursor-pointer w-6 h-6' // Styled as an icon
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>


            {/* Form container with dark background and lighter text */}
            <div className='bg-[#1e1e1e] p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-300 text-sm'>

                {/* Title */}
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign up' ? 'Create account' : 'Login'}</h2>
                {/* Subtitle */}
                <p className='text-center text-sm mb-6 text-gray-400'>{state === 'Sign up' ? 'Create your account' : 'Login to your account'}</p>

                {/* Form */}
                <form onSubmit={onSubmitHandler}>

                    {/* Fullname input (only for Sign up) */}
                    {state === 'Sign up' && (
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#2c2c2c]'>
                            <img src={assets.person_icon} alt="Person icon" /> {/* Added alt text */}
                            <input
                                onChange={e => { setName(e.target.value) }}
                                value={name}
                                type="text"
                                placeholder="Fullname"
                                className='bg-transparent outline-none w-full text-gray-300 placeholder-gray-500' // Added text and placeholder color
                                required
                            />
                        </div>
                    )}

                    {/* Email input */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#2c2c2c]'>
                        <img src={assets.mail_icon} alt="Mail icon" /> {/* Added alt text */}
                        <input
                            type="email"
                            onChange={e => { setEmail(e.target.value) }}
                            value={email}
                            placeholder="Email"
                            className='bg-transparent outline-none w-full text-gray-300 placeholder-gray-500' // Added text and placeholder color
                            required
                        />
                    </div>

                    {/* Password input */}
                    <div className='mb-2 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#2c2c2c]'>
                        <img src={assets.lock_icon} alt="Lock icon" /> {/* Added alt text */}
                        <input
                            type="password"
                            onChange={e => { setPassword(e.target.value) }}
                            value={password}
                            placeholder="Password"
                            className='bg-transparent outline-none w-full text-gray-300 placeholder-gray-500' // Added text and placeholder color
                            required
                        />
                    </div>

                    {/* Forgot password link */}
                    <p className='mb-3 text-blue-400 inline-block cursor-pointer' onClick={() => { navigate('/reset-password'); clearForm(); }}>forgot password?</p> {/* Adjusted color and alignment */}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className={`py-2.5 w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`} // Adjusted gradient colors
                        disabled={isSubmitting}
                        style={isSubmitting ? {} : {}} // Keep this style for overriding if needed, though not strictly necessary here
                    >
                        {isSubmitting ? (
                            <div style={loaderStyle}></div>
                        ) : (
                            state
                        )}
                    </button>
                </form>

                {/* Switch between Login and Sign up */}
                {state === 'Sign up' ? (
                    <p className='text-center text-xs mt-4 text-gray-400'>Already have an account? {' '} {/* Adjusted text color */}
                        <span onClick={() => { setState('Login'); clearForm(); }} className='text-blue-400 underline cursor-pointer'>Login here</span> {/* Adjusted link color */}
                    </p>
                ) : (
                    <p className='text-center text-xs mt-4 text-gray-400'>Dont have an account? {' '} {/* Adjusted text color */}
                        <span onClick={() => { setState('Sign up'); clearForm(); }} className='text-blue-400 underline cursor-pointer'>Sign up</span> {/* Adjusted link color */}
                    </p>
                )}

            </div>
             {/* Inline style for the spin animation keyframes */}
             <style>{spinAnimation}</style>
        </div>
    );
};

export default Login;
