import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext.jsx";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  // ✅ Clean backend URL (remove trailing slashes)
  const API_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:5000";
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const navigate = useNavigate();

  const { user, isLoading: authLoading, isEducator, getToken } = useContext(AuthContext);

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/course/all`);

      if (data.success) {
        setAllCourses(data.courses);
      } else {
        console.error("Server returned error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // ✅ Calculate course ratings
  const calculateRatings = (course) => {
    if (!course?.courseRatings || course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRatings.length);
  };

  // ✅ Calculate course chapter time
  const calculateChapterTime = (chapter) => {
    if (!chapter?.chapterContent) return "0m";
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // ✅ Calculate total course duration
  const calculateCourseDuration = (course) => {
    if (!course?.courseContent) return "0m";
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // ✅ Count total number of lectures in a course
  const calculateNoofLectures = (course) => {
    if (!course?.courseContent) return 0;
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter?.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // ✅ Fetch user enrolled courses
  const fetchUserEnrolledCourses = async () => {
    if (!user) return;

    try {
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  // ✅ Effects
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchUserEnrolledCourses();
      }
      setLoading(false);
    }
  }, [user, authLoading]);

  // ✅ Context value
  const value = {
    currency,
    allCourses,
    navigate,
    calculateRatings,
    isEducator,
    calculateChapterTime,
    calculateNoofLectures,
    calculateCourseDuration,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backend: API_BASE,
    backendUrl: API_BASE,
    userData: user,
    getToken,
    fetchAllCourses,
    loading,
    user,
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
