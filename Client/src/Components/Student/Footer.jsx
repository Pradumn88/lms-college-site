import React from 'react';
import logoDark from '../../assets/logo_dark.png'; // Adjust path and file extension as needed

const Footer = () => {
  return (
    <footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
        <div className="flex flex-col md:items-start items-center w-full md:w-auto">
          <img src={logoDark} alt="Company Logo" className="h-10" /> {/* Added class for sizing */}
          <p className="mt-6 text-center md:text-left text-sm text-white/80">
            Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
        </div>
        <div className="flex flex-col md:items-start items-center w-full md:w-auto">
          <h2 className="font-semibold text-white mb-5">Company</h2>
          <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About us</a></li>
            <li><a href="/contact" className="hover:underline">Contact us</a></li>
            <li><a href="/privacy" className="hover:underline">Privacy policy</a></li>
          </ul>
        </div>
        <div className="flex flex-col md:items-start items-center w-full md:w-auto">
          <h2 className="font-semibold text-white mb-5">Connect us on LinkedIn</h2>
          <p className="text-sm text-white/80">
            For the latest updates, projects, certifications, and our regular posts.
          </p>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm"
              aria-label="Email address for subscription"
            />
            <button
              type="submit"
              className="bg-blue-600 w-24 h-9 text-white rounded hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-white/60">
        Copyright © {new Date().getFullYear()} . All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;