import humanizeDuration from 'humanize-duration'
import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../Context/AppContext'
import { useParams } from 'react-router-dom'
import YouTube from 'react-youtube'
import Footer from '../../Components/Student/Footer'
import Rating from '../../Components/Student/Rating'
import axios from 'axios'
import Loading from '../../Components/Student/Loading'
const Player = () => {

  const {enrolledCourses,calculateChapterTime, backendUrl, getToken , userData, fetchEnrolledCourses}=useContext(AppContext)
  const {courseId} =useParams()
  const [courseData,setCourseData]=useState(null)
  const [openSections,setOpenSections]=useState([])
  const [playerData,setPlayerData]=useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  const getCourseData=()=>{
    enrolledCourses.map((course)=>{
      if(course._id==courseId){
        setCourseData(course)
        course.scourseRating.map((item)=>{
          if(item.userId === userData._id){
            setInitialRating(item.Rating)
          }
        })
      }
    })
  }


  const toggleSection=(index)=>{
    setOpenSections((prev)=>(
      {...prev,[index]: !prev[index],

      }
    ));
  };

  useEffect(()=>{
    if(enrolledCourses.length > 0){
      getCourseData()
    }
  },[enrolledCourses])

  const markLecutreAsCompleted = async (lectureId)=>{
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl+ '/api/users/update-course-progress', {courseId,lectureId},{headers : { Authorization: `Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async ()=>{
    try {
      const token  =  await getToken()
      const { data } = await axios.post(backendUrl +'/api/user/get-course-progress',{courseId}, {headers : { Authorization: `Bearer ${token}`}})
      if(data.success){
        setProgressData(data.progressData)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async ()=>{
    try {
      const token  =  await getToken()
      const { data } = await axios.post(backendUrl +'/api/user/add-rating', {courseId, Rating}, {headers : { Authorization: `Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        fetchUserEnrolledCourses()
      }
      else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    getCourseProgress()
  },[])

  return courseData ? (
    <>
    {/* <div className='p-4 sm:p-10 flex flex-col-reverse md:flex md:flex-cols-reverse gap-10 md:px-36'> */}
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
    {/* Left column   */}
    <div>
      <h2 className='text-xl font-semibold'> Course Structure</h2>
      <div className='pt-5'>
              {courseData && courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={()=>toggleSection(index)}>
                    <div className='flex items-center gap-2'>
                      <img className={`transform transition-transform ${openSections[index] ? '' : 'rotate-270'}`} src={assets.down_arrow_icon} alt="" />
                      <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture,i)=>(
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.lectureUrl && <p onClick={()=> setPlayerData({
                                ...lecture, chapter:index+1, lecture:i+1
                              })} className='cursor-pointer text-blue-500 underline'> Watch</p>}
                              <p>{humanizeDuration(lecture.lectureDuration *60*1000,{units: ['h','m']})}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
        <div className='flex items-center gap-2 py-3 mt-10'>
          <h1 className='text-xl font-bold'>Rate this Course: </h1>
          <Rating initialRating={initialRating} onRate={handleRate}/>
        </div>
    </div>

    {/* right column */}
    <div className='md:mt-10'>
      {playerData ? (
        <div>
          <YouTube videoId={playerData.lectureUrl.split('/').pop()} opts={{playerVars:{ autoplay:1}}} iframeClassName='w-full aspect-video'/> 
          <div className='flex justify-between items-center mt-5'>
            <p className='text-xl font-semibold'>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
            <button onClick={()=> markLecutreAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark as Complete'}</button>
          </div>
        </div>
      ) : 
      <img src={courseData ? courseData.thumbnail : ''} alt="" /> 
      }
    </div>
    </div>

    <Footer/>
    </>
  ) : <Loading/>
}

export default Player
