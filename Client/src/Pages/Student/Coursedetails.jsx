import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../Context/AppContext';
import Loading from '../../Components/Student/Loading';
// import React from 'react';
import { assets } from '../../assets/assets';

const Coursedetails = () => {
  const {id}= useParams();
  const {allCourses,calculateRatings}= useContext(AppContext)
  const [courseData,setCourseData] = useState(null)

  const fetchCourseData= async()=>{
    const findCourse=allCourses.find(course=>course._id ===id)
    setCourseData(findCourse);
  }

  useEffect(()=>{
    fetchCourseData();
  },[])

  return courseData ? (
    <>
    <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left '>
      <div className="absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-cyan-600/70 to-white"></div>

      {/* Left column */}
      <div className='max-w-xl z-10 text-gray-500'>
        <h1 className='sm:text-2xl text-4xl underline font-semibold text-gray-800'>{courseData.courseTitle}</h1>
        <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{__html: courseData.courseDescription.slice(0,200)}}></p>
        <p className='text-sm pt-5'>Course by <span className='text-gray-800 font-semibold'>Krishna Bhambani</span></p>
      </div>

      {/* reviews and ratings */}
      <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
          <p>{calculateRatings(courseData)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, index) => (<img key={index} src={index<Math.floor(calculateRatings(courseData)) ? assets.star : assets.star_blank} alt="star" className='w-3.5 h-3.5'/>))}
          </div>
          <p className='text-gray-500'>({courseData.courseRatings.length} {courseData.courseRatings.length>1 ? 'ratings' :'rating'})</p>
          <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length>1 ? ' students' : ' student'}</p>
        </div>
    </div>

    </>
  ) : <Loading/>
}

export default Coursedetails