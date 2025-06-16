import { createContext,useEffect,useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()
export const AppContextProvider = (props)=>{
    const currency=import.meta.env.VITE_CURRENCY
    const [allCourses, setAllCourses] =useState([])
    const [isEducator,setIsEducator] = useState(true)
    //Fetch all courses
    const fetchAllCourses=async()=>{
        setAllCourses(dummyCourses)
    }

    const navigate=useNavigate()

    //Function to calculate the ratings of the course
    const calculateRatings=(course)=>{
        if(course.courseRatings.length===0) return 0
        let totalRating=0;
        course.courseRatings.forEach(rating=>{
            totalRating+=rating.rating
        })
        return (totalRating/course.courseRatings.length).toFixed(1)
    }    
    useEffect(()=>{
        fetchAllCourses()
    },[])
    const value={
        currency,allCourses,navigate,calculateRatings,isEducator,setIsEducator
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}