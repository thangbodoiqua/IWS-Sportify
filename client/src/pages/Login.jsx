import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import axiosInstance from '../AxiosInstance';

const Login = () => {
    const navigate = useNavigate();
    const { backendUrl, setIsLoggedIn, getUserData, isLoggedIn } = useContext(AppContext).value;
    const [state, setState] = useState('Sign up');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State theo dõi trạng thái submit

    useEffect(() => {
        const interval = setInterval(() => {
            console.log(isLoggedIn);
        }, 3000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);

    if (isLoggedIn) {
        navigate('/');
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setIsSubmitting(true); // Bắt đầu trạng thái submitting

            if (state === 'Sign up') {
                const { data } = await axiosInstance.post(backendUrl + '/api/auth/register', {
                    name,
                    email,
                    password: password,
                });

                if (data.success) {
                    setState('Login');
                    clearForm();
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axiosInstance.post(backendUrl + '/api/auth/login', {
                    email,
                    password: password,
                });

                if (data.success) {
                    setIsLoggedIn(true);
                    getUserData();
                    toast.success(data.message);
                    navigate('/');
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false); // Kết thúc trạng thái submitting dù thành công hay thất bại
        }
    };

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
    };

    const loaderStyle = {
        width: '20px',
        height: '20px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto', // Thêm margin auto để căn giữa ngang
    };

    const spinAnimation = `@keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`;

    return (
        <div className=' flex items-center justify-center min-h-screen sm:px-0 px-6 bg-gradient-to-br from-blue-200 to-purple-400'>
            <img src={assets.logo} onClick={() => navigate('/')} className='absolute left-54 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' alt="" />
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>

                <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign up' ? 'Create account' : 'Login'}</h2>
                <p className='text-center text-sm mb-6'>{state === 'Sign up' ? 'Create your account' : 'Login to your account'}</p>

                <form onSubmit={onSubmitHandler}>

                    {state === 'Sign up' && (
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.person_icon} alt="" />
                            <input onChange={e => { setName(e.target.value) }} value={name} type="text" placeholder="Fullname" className='bg-transparent outline-none' required />
                        </div>
                    )}


                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="" />
                        <input type="email" onChange={e => { setEmail(e.target.value) }} value={email} placeholder="Email" className='bg-transparent outline-none' required />
                    </div>

                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="" />
                        <input type="password" onChange={e => { setPassword(e.target.value) }} value={password} placeholder="Password" className='bg-transparent outline-none' required />
                    </div>


                    <p className='mb-4 text-indigo-400 cursor-pointer' onClick={() => { navigate('/reset-password'); clearForm(); }}>forgot password?</p>

                    <button
                        type="submit"
                        className={`py-2.5 w-full cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                        disabled={isSubmitting}
                        style={isSubmitting ? {} : {}} // Để ghi đè style inline khi không submitting
                    >
                        {isSubmitting ? (
                            <div style={loaderStyle}></div>
                        ) : (
                            state
                        )}
                    </button>
                </form>

                {state === 'Sign up' ? (
                    <p className='text-center text-xs mt-4'>Already have an account? {' '}
                        <span onClick={() => { setState('Login'); clearForm(); }} className='text-blue-400 underline cursor-pointer'>Login here</span>
                    </p>
                ) : (
                    <p className='text-center text-xs mt-4'>Dont have an account? {' '}
                        <span onClick={() => { setState('Sign up'); clearForm(); }} className='text-blue-400 underline cursor-pointer'>Sign up</span>
                    </p>
                )}

            </div>
        </div>
    );
};

export default Login;