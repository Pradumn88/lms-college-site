import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../Context/AppContext';
import Loading from '../../Components/Student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../Components/Student/Footer'
import YouTube from 'react-youtube'
import { toast } from 'react-toastify';
import axios from 'axios';

const Coursedetails = () => {
  const {id}= useParams();
  const {allCourses,calculateRatings,calculateCourseDuration,calculateChapterTime,calculateNoofLectures,currency,backend , userData, getToken}= useContext(AppContext)
  const [courseData,setCourseData] = useState(null)
  const [openSections,setOpenSections] = useState({})
  const [isAlreadyEnrolled,setIsAlreadyEnrolled] = useState(false)
  const [playerData,setPlayerData] = useState(null)



  const fetchCourseData= async()=>{
    try {
      const response = await axios.get(backend + '/api/course/' + id);
      // If response is HTML, not JSON, show error
      if (typeof response.data === 'string' && response.data.startsWith('<!doctype html>')) {
        toast.error('Course details API returned HTML. Backend route may be missing or misconfigured.');
        // fallback: try to find course from allCourses
        const fallbackCourse = allCourses?.find(c => c._id === id);
        if (fallbackCourse) {
          setCourseData(fallbackCourse);
        }
        return;
      }
      const data = response.data;
      console.log('Course details API response:', data);
      if(data && data.success && data.courseData) {
        setCourseData(data.courseData);
      } else {
        // fallback: try to find course from allCourses
        const fallbackCourse = allCourses?.find(c => c._id === id);
        if (fallbackCourse) {
          setCourseData(fallbackCourse);
        } else {
          toast.error(data?.message || 'Course not found');
        }
      }
    } catch (error) {
      // fallback: try to find course from allCourses
      const fallbackCourse = allCourses?.find(c => c._id === id);
      if (fallbackCourse) {
        setCourseData(fallbackCourse);
      } else {
        toast.error(error.message);
      }
    }
  }

  const enrollCourse = async () => {
  try {
    // Check if user is authenticated
    if (!userData) {
      toast.warn('Please login to enroll in the course');
      return;
    }

    // Prevent duplicate enrollments
    if (isAlreadyEnrolled) {
      toast.warn('Already Enrolled');
      return;
    }

    // Find the enroll button safely
    const enrollButton = document.querySelector('button#enroll-button');
    if (!enrollButton) {
      console.warn('Enroll button not found in the DOM.');
      return;
    }

    const originalText = enrollButton.textContent;
    enrollButton.textContent = 'Processing...';
    enrollButton.disabled = true;

    // Get authentication token
    let token;
    try {
      token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      toast.error('Authentication failed. Please try logging in again.');

      // Reset button state
      enrollButton.textContent = originalText;
      enrollButton.disabled = false;
      return;
    }

    // Make enrollment API call
    const { data } = await axios.post(
      `${backend}/api/user/purchase`,
      { courseId: courseData._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Handle response
    if (data.success && data.session_url) {
      window.location.replace(data.session_url);
    } else {
      toast.error(data.message || 'Enrollment failed');
    }

  } catch (error) {
    console.error('Enrollment error:', error);
    toast.error(error.message || 'An error occurred during enrollment');
  } finally {
    // Reset enroll button state
    const enrollButton = document.querySelector('button#enroll-button');
    if (enrollButton) {
      enrollButton.textContent = isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now';
      enrollButton.disabled = false;
    }
  }
};


  useEffect(()=>{
    fetchCourseData();
  },[])

  useEffect(()=>{
    if(userData &&  courseData){
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }
  },[userData,courseData])

  const toggleSection=(index)=>{
    setOpenSections((prev)=>(
      {...prev,[index]: !prev[index],

      }
    ));
  };

  return courseData ? (
    <>
    <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left '>
      <div className="absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-cyan-600/70 to-white"></div>

      {/* Left column */}
      <div className='max-w-xl z-10 text-gray-500'>
        <h1 className='sm:text-2xl text-4xl underline font-semibold text-gray-800'>{courseData.courseTitle}</h1>
        <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{__html: (courseData.courseDescription || '').slice(0,200)}}></p>
        <p className='text-sm pt-5'>Course by <span className='text-gray-800 font-semibold'>{courseData.educator?.name || 'Unknown'}</span></p>
        <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
          <p>{calculateRatings(courseData)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, index) => (<img key={index} src={index<Math.floor(calculateRatings(courseData)) ? assets.star : assets.star_blank} alt="star" className='w-3.5 h-3.5'/>))}
          </div>
          <p className='text-gray-500'>({(courseData.courseRatings || []).length} {(courseData.courseRatings || []).length>1 ? 'ratings' :'rating'})</p>
          <p>{(courseData.enrolledStudents || []).length} {(courseData.enrolledStudents || []).length>1 ? ' students enrolled' : ' student enrolled'}</p>
        </div>
        <div className='pt-8 text-gray-700'>
            <div className='pt-5'>
              {(courseData.courseContent || []).map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={()=>toggleSection(index)}>
                    <div className='flex items-center gap-2'>
                      <img className={`transform transition-transform ${openSections[index] ? '' : 'rotate-270'}`} src={assets.down_arrow_icon} alt="" />
                      <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-default'>{(chapter.chapterContent || []).length} lectures - {calculateChapterTime(chapter)}</p>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {(chapter.chapterContent || []).map((lecture,i)=>(
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={assets.play_icon} alt="" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && <p onClick={()=> setPlayerData({
                                videoId: lecture.lectureUrl?.split('/').pop() //gives the videoId
                              })} className='cursor-pointer text-blue-500'> Preview</p>}
                              <p>{humanizeDuration((lecture.lectureDuration || 0) *60*1000,{units: ['h','m']})}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
        </div>

        <div className='py-20 text-sm md:text-default'>
          <h3 className='text-xl font-semibold text-gray-800 underline'>Course Description</h3>
          <p className='pt-3 text-[15px] text-[#7A7B7D] mb-16' dangerouslySetInnerHTML={{__html: courseData.courseDescription || ''}}></p>
        </div>
      </div>
      <div></div>
      {/* reviews and ratings */}
        <div className='max-w-course-card z-10 shadow rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
          { playerData ? <YouTube videoId={playerData.videoId} opts={{playerVars:{ autoplay:1}}} iframeClassName='w-full aspect-video'/> 
          : <img src={courseData.courseThumbnail || ''} alt="" />
          }
          <div className='p-5'>
              <div className='flex items-center gap-2'>
                <img src={assets.time_left_clock_icon} alt="" className='w-3.5'/>
                <p className='text-red-700'> <span className='font-medium'>5 days</span> left at this price</p>
              </div>
              <div className='flex gap-3 items-center pt-2'>
                <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{((courseData.coursePrice || 0)-(courseData.discount || 0) * (courseData.coursePrice || 0) / 100).toFixed(2)}</p>
                <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice || 0}</p>
                <p className='md:text-lg text-gray-500'>{courseData.discount || 0}% OFF</p>
              </div>
              <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
                <div className='flex items-center gap-1'>
                  <img src={assets.star} alt="" />
                  <p>{calculateRatings(courseData)}</p>
                </div>

                <div className='h-4 w-px bg-gray-500/40'></div>

                <div className='flex items-center gap-1'>
                  <img src={assets.time_clock_icon} alt="" />
                  <p>{calculateCourseDuration(courseData)}</p>
                </div>

                <div className='h-4 w-px bg-gray-500/40'></div>

                <div className='flex items-center gap-1'>
                  <img src={assets.time_clock_icon} alt="" />
                  <p>{calculateNoofLectures(courseData)}</p>
                </div>
              </div>
              <button id="enroll-button" onClick={enrollCourse} className='md:mt-6 mt-4 w-full py-3 round bg-blue-600 text-white font-medium cursor-pointer'>{isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}</button>
              <div className='pt-6'>
                <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
                <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-600'>
                  <li>Lifetime access with free updates</li>
                  <li>Step-by-Step, hands-on project guidance</li>
                  <li>Downloadable resource and source code.</li>
                  <li> Quizzes to test your knowledge</li>
                  <li>Certificate of completion</li>
                </ul>
              </div>
          </div>
        </div>
    </div>
    <Footer/>
    </>
  ) : <Loading/>
}

export default Coursedetails