// Vercel-ready: This file is compatible with Vercel deployment
import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from "./Pages/Student/Home.jsx";
import EditCourse from './Pages/Educator/EditCourse.jsx';
import MyEnrollments from './Pages/Student/MyEnrollments.jsx'
import CoursesList from './Pages/Student/CoursesList.jsx'
import Coursedetails from './Pages/Student/Coursedetails.jsx'
import Player from './Pages/Student/Player.jsx'
import Educatorr from './Pages/Educator/Educatorr.jsx'
import Dashboard from './Pages/Educator/Dashboard.jsx'
import AddCourse from './Pages/Educator/AddCourse.jsx'
import MyCourses from './Pages/Educator/MyCourses.jsx'
import StudentEnrolled from './Pages/Educator/StudentsEnrolled.jsx'
import PurchaseLogs from './Pages/Educator/PurchaseLogs.jsx'
import Loading from './Components/Student/Loading.jsx'
import Navbar from './Components/Student/Navbar.jsx';
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';

// Login and Admin imports
import Login from './Pages/Login.jsx';
import AdminLogin from './Pages/AdminLogin.jsx';
import Admin from './Pages/Admin/Admin.jsx';
import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import AdminEducators from './Pages/Admin/AdminEducators.jsx';
import AdminCourses from './Pages/Admin/AdminCourses.jsx';
import AdminStudents from './Pages/Admin/AdminStudents.jsx';
import AdminTransactions from './Pages/Admin/AdminTransactions.jsx';
import { AdminContextProvider } from './Context/AdminContext.jsx';

// Student dashboard imports
import StudentDashboard from './Pages/Student/StudentDashboard.jsx';
import PaymentHistory from './Pages/Student/PaymentHistory.jsx';
import Educators from './Pages/Student/Educators.jsx';
import EducatorCourses from './Pages/Student/EducatorCourses.jsx';

// Chatbot
import ChatWidget from './Components/ChatWidget.jsx';

const App = () => {
  const isEducatorRoute = useMatch('/Educator/*')
  const isAdminRoute = useMatch('/admin/*')
  const isLoginRoute = useMatch('/login')
  const isAdminLoginRoute = useMatch('/admin-login')

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer />
      {!isEducatorRoute && !isAdminRoute && !isLoginRoute && !isAdminLoginRoute && <Navbar />}
      {!isEducatorRoute && !isAdminRoute && !isLoginRoute && !isAdminLoginRoute && <ChatWidget />}
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/Course-List' element={<CoursesList />} />
        <Route path='/Course-List/:input' element={<CoursesList />} />
        <Route path='/Course/:id' element={<Coursedetails />} />
        <Route path='/loading/:path' element={<Loading />} />

        {/* Student routes */}
        <Route path='/dashboard' element={<StudentDashboard />} />
        <Route path='/my-enrollments' element={<MyEnrollments />} />
        <Route path='/payment-history' element={<PaymentHistory />} />
        <Route path='/educators' element={<Educators />} />
        <Route path='/educators/:educatorId' element={<EducatorCourses />} />
        <Route path='/player/:courseId' element={<Player />} />

        {/* Educator routes */}
        <Route path='/Educator' element={<Educatorr />}>
          <Route path='/Educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='students-enrolled' element={<StudentEnrolled />} />
          <Route path='purchase-logs' element={<PurchaseLogs />} />
          <Route path='edit-course/:id' element={<EditCourse />} />
        </Route>

        {/* Admin routes */}
        <Route path='/admin/*' element={
          <AdminContextProvider>
            <Routes>
              <Route path='/' element={<Admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path='educators' element={<AdminEducators />} />
                <Route path='courses' element={<AdminCourses />} />
                <Route path='students' element={<AdminStudents />} />
                <Route path='transactions' element={<AdminTransactions />} />
              </Route>
            </Routes>
          </AdminContextProvider>
        } />
      </Routes>
    </div>
  )
}

export default App