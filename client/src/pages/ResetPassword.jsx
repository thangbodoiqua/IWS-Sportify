import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IoArrowBackOutline } from 'react-icons/io5'; // Import icon mũi tên từ react-icons

const ResetPassword= ()=>{
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

    axios.defaults.withCredential = true;

    const [email, setEmail]= useState('')
    const [newPassword, setNewPassword]= useState('')
    const [isEmailSent, setIsEmailSent]= useState('')
    const [otp, setOtp]= useState(0)
    const [isOtpSubmited, setisOtpSubmited]= useState(false)
    const inputRefs = React.useRef([]);

const handleInput = (e, index) => {
  if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
    inputRefs.current[index + 1].focus();
  }
};

const handleKeyDown = (e, index) => {
  if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
    inputRefs.current[index - 1].focus();
  }
};

const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };


  const onSubmitEmail=  async(e) =>{
      e.preventDefault();

      try {
         const {data} = await axios.post('http://localhost:4000'+'/api/auth/send-reset-otp',{email})
         data.success ? toast.success(data.message): toast.error(data.message)
         data.success && setIsEmailSent(true)
      } catch (error) {
        toast.error(error.message)
      }
  }

  const onSubmitOTP = async(e) =>{
    e.preventDefault();
    const otpArray= inputRefs.current.map(e=> e.value)
    setOtp(otpArray.join(''))
    setisOtpSubmited(true)
  }


  const onSubmitNewPassword= async (e) =>{
    e.preventDefault();
    try {
        
        const {data}= await axios.post('http://localhost:4000'+'/api/auth/reset-password', {email, otp, newPassword})
        data.success? toast.success(data.message) : toast.error(data.message)
        data.success && navigate('/login')
    } catch (error) {
        toast.error(error.message)
    }
  }

return (
  <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 relative'> {/* Thêm relative để định vị tuyệt đối cho nút Back */}
    <img onClick={() => navigate('/')} src={assets.logo} alt=''
     className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

    {!isEmailSent ? (
      <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm mt-12 relative'> {/* Thêm relative cho form */}
        <button
          onClick={() => navigate('/login')}
          className='absolute top-4 left-4 p-1 rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <IoArrowBackOutline className="w-6 h-6" />
        </button>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your register email address</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.mail_icon} alt='' className='w-3 h-3' />
          <input
            type='email'
            placeholder='Email id'
            className='bg-transparent outline-none text-white'
            value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900
        text-white rounded-full mt-3'>Submit</button>
      </form>
    ) : !isOtpSubmited ? (
      <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm mt-12 relative'> {/* Thêm relative cho form */}
        <button
          onClick={() => navigate('/login')}
          className='absolute top-4 left-4 p-1 rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <IoArrowBackOutline className="w-6 h-6" />
        </button>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type='text'
                maxLength='1'
                key={index}
                required
                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
          ))}
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500
        to-indigo-900 text-white rounded-full'>Submit</button>
      </form>
    ) : (
      <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm mt-12 relative'> {/* Thêm relative cho form */}
        <button
          onClick={() => navigate('/login')}
          className='absolute top-4 cursor-pointer left-4 p-1 rounded-full text-gray-300  hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300'
        >
          <IoArrowBackOutline className="w-6 h-6 " />
        </button>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your new password</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.lock_icon} alt='' className='w-3 h-3' />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            className='bg-transparent outline-none text-white flex-grow'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className='cursor-pointer focus:outline-none'
            onClick={togglePasswordVisibility}
          >
            <img
              src={showPassword ? assets.eye_solid : assets.eye_slash_solid}
              alt={showPassword ? 'Hide password' : 'Show password'}
              className='w-5 h-5'
            />
          </button>
        </div>
        <button className='cursor-pointer w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>
          Submit
        </button>
      </form>
    )}
  </div>
);

}
export default ResetPassword