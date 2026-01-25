import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAuth } from '../../Context/AuthContext.jsx'

const CalltoAction = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <div className='flex flex-col items-center justify-center gap-4 pt-10 pb-15 px-8 md:px-0'>
      <h1 className='text-xl md:text-4xl text-gray-800 font-semibold'>Learn anything, anytime, anywhere</h1>
      <div className='flex items-center font-medium gap-6 mt-4'>
        {user ? '' : (
          <>
            <button onClick={handleGetStarted} className='px-10 py-3 rounded-sm text-white bg-blue-800 cursor-pointer'>Get Started</button>
            <button className='flex items-center gap-2 cursor-pointer' onClick={scrollToTop}>Learn More <img src={assets.arrow_icon} alt="arrow-icon" /> </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CalltoAction
