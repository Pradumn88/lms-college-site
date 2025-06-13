import React from 'react'
import {assets} from '../../assets/assets.js'
import { Link } from 'react-router-dom'
import { useClerk, useUser,SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';


const Navbar = () => {

  const IsCoursePage=location.pathname.includes('/Course-List') 
  const {openSignIn}=useClerk()
  const {user}=useUser()

  return (
    <div className={`flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-30 border-b py-4 ${IsCoursePage ? 'bg-amber-100' :'bg-cyan-300'}`}>
      <img src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer'/>
      <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex justify-between items-center gap-3'>
          {user &&<>
            <button className='cursor-pointer'>Become Educator</button>
          | <Link to='/my-enrollments'>My Enrollments </Link>
          </>
          }
        </div>

        {user ? <UserButton/> :
          <button onClick={()=> {openSignIn()}} className='bg-blue-500 rounded-xl text-white px-5 py-2 cursor-pointer'>Create Account</button>}
      </div>

      {/* For phone screens */}
      <div className="lg:hidden md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className='flex items-center gap-1 max-sm:text-xs'>
          {user && <>
            <button className='cursor-pointer'>Become Educator</button>
          | <Link to='/my-enrollments'>My Enrollments </Link>
          </>
          }
          </div>
          { user ? <UserButton/> :
            <button onClick={()=> openSignIn()}><img src={assets.user_icon} alt="" />
            </button>
          }
      </div>
    </div>
  )
}

export default Navbar
