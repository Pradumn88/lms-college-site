import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className='bg-gray-900 md:px-36 text-left w-full mt-10'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
        {/* Logo + LMS Description */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt="logo" />
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>
            Edemy is a modern Learning Management System (LMS) that offers a wide variety of professional courses online. Our platform enables learners to gain skills through expertly designed content, quizzes, and real-time feedback — all in one place.
          </p>
        </div>

        {/* Company Links */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-white mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
            <li><a href="/" className='hover:underline'>Home</a></li>
            <li><span className='cursor-default hover:underline'>About us</span></li>
            <li><span className='cursor-default hover:underline'>Privacy policy</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-semibold text-white mb-5'>Reach us at</h2>
          <p className='text-sm text-white/80'>pandeypradumn2222@gmail.com</p>
          <p className='text-sm text-white/80'>krishnabhambani1@gmail.com</p>
        </div>
      </div>

      <p className='py-4 text-center text-xs md:text-sm text-white/60'>
        Copyright 2025. All Rights Reserved
      </p>
    </footer>
  );
};
export default Footer;