import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='py-2 flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t'>
      <div className='flex items-center gap-2'>
        <img src={assets.logo} alt="logo" className='hidden md:block w-20' />
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className='py-2 text-center text-xs md:text-sm text-gray-700'> Copyright 2025 &copy; AIM. All rights reserved</p>
      </div>
      <div className='flex items-center gap-3 max-md:mt-4'>
          <a href="#">
            <img src={assets.facebook_icon} alt="" />
          </a>
          <a href="#">
            <img src={assets.instagram_icon} alt="" />
          </a>
          <a href="#">
            <img src={assets.twitter_icon} alt="" />
          </a>
      </div>
    </footer>
  )
}

export default Footer

/*
import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 py-5 border-t bg-black'>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Logo + Copyright 
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <img src={assets.logo} alt="logo" className="w-20" />
          <span>© 2025 <span className="text-blue-400 font-semibold">AIM</span>. All rights reserved.</span>
        </div>

        {/* Right Side: Social Icons }
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-400 transition duration-300">
            <img src={assets.facebook_icon} alt="Facebook" className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-pink-400 transition duration-300">
            <img src={assets.instagram_icon} alt="Instagram" className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-sky-400 transition duration-300">
            <img src={assets.twitter_icon} alt="Twitter" className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
*/