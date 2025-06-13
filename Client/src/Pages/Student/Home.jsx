import React from 'react'
import Hero from '../../Components/Student/Hero'
import Searchbar from '../../Components/Student/Searchbar'
import Companies from '../../Components/Student/Companies'
import CourseSection from '../../Components/Student/CourseSection'

const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero/>
      <Searchbar/>
      <Companies/>
      <CourseSection/>
    </div>
  )
}

export default Home
