// import { createContext,useEffect,useState } from "react";
// import { dummyCourses } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import humanizeDuration from "humanize-duration";
// import { useAuth, useUser } from "@clerk/clerk-react"; 
// import axios from 'axios'
// import { toast } from "react-toastify";

// export const AppContext = createContext()
// export const AppContextProvider = (props)=>{
//     const backendUrl = import.meta.env.VITE_BACKEND_URL
//     const currency=import.meta.env.VITE_CURRENCY  
//     const navigate = useNavigate()

//     const {getToken} = useAuth()
//     const {user, isLoaded: isUserLoaded} = useUser()

//     const [allCourses, setAllCourses] =useState([])
//     const [isEducator,setIsEducator] = useState(false)
//     const [enrolledCourses,setEnrolledCourses] = useState([])
//     const [userData,setUserData] = useState(null)
//     const [loading, setLoading] = useState(true)

//     //Fetch all courses
//     const fetchAllCourses=async()=>{
//         try {
//             console.log('Fetching courses from:', backendUrl + '/api/course/all');
//             const {data} = await axios.get(backendUrl + '/api/course/all');
//             console.log('Response from server:', data);

//             if(data.success){
//                 console.log('Courses fetched successfully:', data.courses);
//                 setAllCourses(data.courses)
//             }else{
//                 console.error('Server returned error:', data.message);
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             console.error('Error fetching courses:', error);
//             toast.error(error.message)
//         }
//     }

//     //fetch user data
//     const fetchUserData = async()=>{
//         if (!user) return;
        
//         try {
//             if(user?.publicMetadata?.role === 'educator'){
//                 setIsEducator(true)
//             }

//             const token = await getToken();
//             const {data} = await axios.get(backendUrl + '/api/user/data', {
//                 headers : {Authorization: `Bearer ${token}`}
//             });

//             if(data.success){
//                 setUserData(data.user)
//             } else {
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             console.error('Error fetching user data:', error);
//             toast.error(error.message)
//         } finally {
//             setLoading(false)
//         }
//     }

//     //Function to calculate the ratings of the course
//     const calculateRatings=(course)=>{
//         if(!course?.courseRatings || course.courseRatings.length===0) return 0
//         let totalRating=0;
//         course.courseRatings.forEach(rating=>{
//             totalRating+=rating.rating
//         })
//         return Math.floor(totalRating / course.courseRatings.length)
//     }

//     // Function to calculate course chapter time
//     const calculateChapterTime=(chapter)=>{
//         if(!chapter?.chapterContent) return '0m'
//         let time=0;
//         chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration)
//         return humanizeDuration(time*60*1000,{units:['h','m']})
//     }

//     // Function to calculate course duration
//     const calculateCourseDuration=(course)=>{
//         if(!course?.courseContent) return '0m'
//         let time=0;
//         course.courseContent.map((chapter)=> chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration))
//         return humanizeDuration(time*60*1000,{units:['h','m']})
//     }

//     //Function to calculate number of lectures in a course (Fixed name to match usage)
//     const calculateNoofLectures=(course)=>{
//         if (!course?.courseContent) return 0;
//         let totalLectures=0;
//         course.courseContent.forEach(chapter =>{
//             if(Array.isArray(chapter?.chapterContent)){
//                 totalLectures += chapter.chapterContent.length;
//             }
//         });
//         return totalLectures;
//     }

//     //Fetch User enrolled course
//     const fetchUserEnrolledCourses=async()=>{
//         if (!user) return;
        
//         try {
//             const token = await getToken();
//             const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
//                 headers : {Authorization: `Bearer ${token}`}
//             });

//             if(data.success){
//                 setEnrolledCourses(data.enrolledCourses.reverse())
//             } else {
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             console.error('Error fetching enrolled courses:', error);
//             toast.error(error.message)
//         }
//     }

//     useEffect(()=>{
//         fetchAllCourses()
//     },[])

//     useEffect(()=>{
//         if(isUserLoaded) {
//             if(user) {
//                 fetchUserData()
//                 fetchUserEnrolledCourses()
//             } else {
//                 setLoading(false)
//             }
//         }
//     },[user, isUserLoaded])
    
//     const value={
//         currency,
//         allCourses,
//         navigate,
//         calculateRatings,
//         isEducator,
//         setIsEducator,
//         calculateChapterTime,
//         calculateNoofLectures,  // Fixed to match the function name (lowercase 'o')
//         calculateCourseDuration,
//         enrolledCourses,
//         fetchUserEnrolledCourses,
//         backend: backendUrl,  // Added alias for backend
//         userData,
//         setUserData,
//         getToken,
//         fetchAllCourses,
//         loading
//     }

//     if (!isUserLoaded || loading) {
//         return <div className="flex justify-center items-center min-h-screen">Loading...</div>
//     }

//     return (
//         <AppContext.Provider value={value}>
//             {props.children}
//         </AppContext.Provider>
//     )
// }

import { createContext,useEffect,useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react"; 
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext()
export const AppContextProvider = (props)=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency=import.meta.env.VITE_CURRENCY  
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user, isLoaded: isUserLoaded} = useUser()

    const [allCourses, setAllCourses] =useState([])
    const [isEducator,setIsEducator] = useState(false)
    const [enrolledCourses,setEnrolledCourses] = useState([])
    const [userData,setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    //Fetch all courses
    const fetchAllCourses=async()=>{
        try {
            console.log('Fetching courses from:', backendUrl + '/api/course/all');
            const {data} = await axios.get(backendUrl + '/api/course/all');
            console.log('Response from server:', data);

            if(data.success){
                console.log('Courses fetched successfully:', data.courses);
                setAllCourses(data.courses)
            }else{
                console.error('Server returned error:', data.message);
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error(error.message)
        }
    }

    //fetch user data
    const fetchUserData = async()=>{
        if (!user) return;
        
        try {
            if(user?.publicMetadata?.role === 'educator'){
                setIsEducator(true)
            }

            const token = await getToken();
            const {data} = await axios.get(backendUrl + '/api/user/data', {
                headers : {Authorization: `Bearer ${token}`}
            });

            if(data.success){
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    //Function to calculate the ratings of the course
    const calculateRatings=(course)=>{
        if(!course?.courseRatings || course.courseRatings.length===0) return 0
        let totalRating=0;
        course.courseRatings.forEach(rating=>{
            totalRating+=rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    // Function to calculate course chapter time
    const calculateChapterTime=(chapter)=>{
        if(!chapter?.chapterContent) return '0m'
        let time=0;
        chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration)
        return humanizeDuration(time*60*1000,{units:['h','m']})
    }

    // Function to calculate course duration
    const calculateCourseDuration=(course)=>{
        if(!course?.courseContent) return '0m'
        let time=0;
        course.courseContent.map((chapter)=> chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration))
        return humanizeDuration(time*60*1000,{units:['h','m']})
    }

    //Function to calculate number of lectures in a course (Fixed name to match usage)
    const calculateNoofLectures=(course)=>{
        if (!course?.courseContent) return 0;
        let totalLectures=0;
        course.courseContent.forEach(chapter =>{
            if(Array.isArray(chapter?.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    //Fetch User enrolled course
    const fetchUserEnrolledCourses=async()=>{
        if (!user) return;
        
        try {
            const token = await getToken();
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {
                headers : {Authorization: `Bearer ${token}`}
            });

            if(data.success){
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchAllCourses()
    },[])

    useEffect(()=>{
        if(isUserLoaded) {
            if(user) {
                fetchUserData()
                fetchUserEnrolledCourses()
            } else {
                setLoading(false)
            }
        }
    },[user, isUserLoaded])
    
    const value={
        currency,
        allCourses,
        navigate,
        calculateRatings,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateNoofLectures,  // Fixed to match the function name (lowercase 'o')
        calculateCourseDuration,
        enrolledCourses,
        fetchUserEnrolledCourses,
        backend: backendUrl,  // Added alias for backend
        userData,
        setUserData,
        getToken,
        fetchAllCourses,
        loading
    }

    if (!isUserLoaded || loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}