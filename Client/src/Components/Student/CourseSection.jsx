import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../Context/AppContext.jsx'
import Coursecard from './Coursecard'

const CourseSection = () => {
  const { allCourses } = useContext(AppContext)
  const navigate = useNavigate()

  const handleShowAllCourses = () => {
    window.scrollTo(0, 0)
    navigate('/Course-List')
  }

  // Show only 3 courses for a single row on home page
  const displayCourses = allCourses.slice(0, 3)

  return (
    <div className='py-16 md:px-40 px-8 w-full'>
      <h2 className='text-3xl font-medium text-gray-700'>Learn from the best</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3 max-w-2xl mx-auto'>
        Discover our top-rated courses across various categories. From coding and design to business and wellness.
      </p>

      {/* Single row grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10'>
        {displayCourses.map((course, index) => (
          <Coursecard key={index} course={course} />
        ))}
      </div>

      <button
        onClick={handleShowAllCourses}
        className='px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all'
      >
        Browse All Courses →
      </button>
    </div>
  )
}

export default CourseSection
