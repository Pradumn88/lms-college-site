import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { AppContext } from '../../Context/AppContext.jsx'
import { motion } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()
  const isCoursePage = location.pathname.includes('/educator')

  const { user, isEducator, logout } = useContext(AuthContext)
  const { navigate } = useContext(AppContext)

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-8 md:px-14 py-4 border-b 
      ${isCoursePage ? 'bg-gradient-to-r from-blue-300 to-cyan-800' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500'}`}
    >
      {/* Logo */}
      <div onClick={() => navigate('/')} className="cursor-pointer">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-cyan-200 drop-shadow"
        >
          A<span className="text-white">I</span>M
        </motion.h1>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-5 text-white font-medium">
        {user && (
          <div className="flex items-center gap-3">
            {isEducator && (
              <>
                <Link to="/educator" className="hover:text-yellow-200 transition-colors">
                  Educator Dashboard
                </Link>
                <span>|</span>
              </>
            )}
            <Link to="/my-enrollments" className="hover:text-yellow-200 transition-colors">
              My Enrollments
            </Link>
          </div>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user.imageUrl || '/user_icon.svg'}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-white/30"
              />
              <span className="text-sm">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden items-center gap-3 text-white text-sm">
        {user && (
          <div className="flex flex-col items-end gap-1 max-sm:text-xs">
            {isEducator && (
              <Link to="/educator" className="hover:text-yellow-200 transition-colors">
                Educator
              </Link>
            )}
            <Link to="/my-enrollments">Enrollments</Link>
          </div>
        )}
        {user ? (
          <button
            onClick={logout}
            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 font-semibold px-3 py-1.5 rounded-lg text-xs"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
