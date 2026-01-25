import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { motion } from 'framer-motion'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="flex items-center justify-between px-6 md:px-12 py-4 shadow-md bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">

      {/* Stylish Project Name: AIM */}
      <Link to="/" className="flex items-center">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-cyan-300 drop-shadow-lg"
        >
          A<span className="text-white">I</span>M
        </motion.h1>
      </Link>

      {/* Greeting and Profile */}
      <div className="flex items-center gap-4 text-white font-medium">
        <p className="text-sm md:text-base">Hi, {user ? user.name : 'Developer'} 👋</p>
        {user ? (
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl || '/user_icon.svg'}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default Navbar
