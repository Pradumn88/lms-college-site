import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../Context/AppContext'
import Searchbar from '../../Components/Student/Searchbar'
import { useParams } from 'react-router-dom'
import Coursecard from '../../Components/Student/Coursecard'
import { assets } from '../../assets/assets'
import Footer from '../../Components/Student/Footer'

const CoursesList = () => {
  const { navigate, allCourses } = useContext(AppContext)
  const { input } = useParams()
  const [filteredCourses, setFilteredCourses] = useState([])

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice();
      if (input) {
        const filtered = tempCourses.filter(
          item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses(tempCourses);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [allCourses, input])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className='md:px-40 px-8 pt-24 pb-16'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full mb-20'>
          <div>
            <h1 className='text-4xl font-bold text-white'>Explore Courses</h1>
            <p className='text-gray-400 mt-2'>
              <span className='text-purple-400 cursor-pointer hover:text-purple-300' onClick={() => navigate('/')}>Home</span>
              <span className='mx-2'>/</span>
              <span className='text-gray-300'>Courses</span>
            </p>
          </div>
          <Searchbar data={input} />
        </div>

        {input && (
          <div className='inline-flex items-center gap-4 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg mb-6 text-gray-300'>
            <p>Searching: "{input}"</p>
            <img src={assets.cross_icon} alt="" onClick={() => navigate('/Course-List')} className='cursor-pointer invert opacity-70 hover:opacity-100 w-4' />
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8'>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <Coursecard key={index} course={course} />
            ))
          ) : (
            <div className='col-span-full text-center py-16'>
              <div className='text-6xl mb-4'>📚</div>
              <p className='text-gray-400 text-xl'>No courses found</p>
              <p className='text-gray-500 mt-2'>Try a different search term</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CoursesList
