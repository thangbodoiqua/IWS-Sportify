import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext';

const Header = () => {
  const { user } = useContext(AppContext).value; 
  console.log(user)
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <img src={assets.header_img} className='w-36 h-36 rounded-full mb-6' alt="" />
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'> Hello {user?user.username:'User'}! 
        <img className='w-8 aspect-square ' src={assets.hand_wave} alt="" />
      </h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>
        Welcome to my app
      </h2>
      <p className='mb-8 max-w-md'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quae illum reprehenderit, ad explicabo nam magnam ex ratione, ipsa debitis hic voluptates fugiat exercitationem eaque nobis obcaecati deserunt consequuntur. Doloremque, autem.</p>
      <button className='border border-gray-500 rounded-full px-8 py-2 hover:bg-gray-100 transition-all cursor-pointer'>Get Started</button>
    </div>
  )
}

export default Header
