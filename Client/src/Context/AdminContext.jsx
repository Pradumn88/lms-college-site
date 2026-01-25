import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

export const AdminContextProvider = ({ children }) => {
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
    const navigate = useNavigate();

    const [isAdminAuth, setIsAdminAuth] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stats
    const [dashboardStats, setDashboardStats] = useState(null);
    const [educators, setEducators] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const getAdminToken = () => localStorage.getItem('adminToken');

    const adminAxios = axios.create({
        baseURL: API_BASE,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Add token to requests
    adminAxios.interceptors.request.use((config) => {
        const token = getAdminToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Verify admin on mount
    useEffect(() => {
        const verifyAdmin = async () => {
            const token = getAdminToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await adminAxios.get('/api/admin/verify');
                if (data.success) {
                    setIsAdminAuth(true);
                    setAdminData(data.admin);
                } else {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminData');
                }
            } catch (error) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, []);

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/dashboard');
            if (data.success) {
                setDashboardStats(data.stats);
                return data;
            }
        } catch (error) {
            toast.error('Failed to fetch dashboard stats');
        }
    };

    // Fetch all educators
    const fetchEducators = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/educators');
            if (data.success) {
                setEducators(data.educators);
            }
        } catch (error) {
            toast.error('Failed to fetch educators');
        }
    };

    // Remove educator
    const removeEducator = async (educatorId) => {
        try {
            const { data } = await adminAxios.delete(`/api/admin/educators/${educatorId}`);
            if (data.success) {
                toast.success('Educator removed successfully');
                fetchEducators();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to remove educator');
        }
    };

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/courses');
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            toast.error('Failed to fetch courses');
        }
    };

    // Update course
    const updateCourse = async (courseId, updateData) => {
        try {
            const { data } = await adminAxios.put(`/api/admin/courses/${courseId}`, updateData);
            if (data.success) {
                toast.success('Course updated successfully');
                fetchCourses();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error('Failed to update course');
            return false;
        }
    };

    // Delete course
    const deleteCourse = async (courseId) => {
        try {
            const { data } = await adminAxios.delete(`/api/admin/courses/${courseId}`);
            if (data.success) {
                toast.success('Course deleted successfully');
                fetchCourses();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to delete course');
        }
    };

    // Toggle course publish status
    const toggleCoursePublish = async (courseId) => {
        try {
            const { data } = await adminAxios.patch(`/api/admin/courses/${courseId}/toggle-publish`);
            if (data.success) {
                toast.success(data.message);
                fetchCourses();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to toggle course status');
        }
    };

    // Fetch all students
    const fetchStudents = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/students');
            if (data.success) {
                setStudents(data.students);
            }
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    // Get student details
    const getStudentDetails = async (studentId) => {
        try {
            const { data } = await adminAxios.get(`/api/admin/students/${studentId}`);
            if (data.success) {
                return data;
            }
        } catch (error) {
            toast.error('Failed to fetch student details');
        }
    };

    // Remove student
    const removeStudent = async (studentId) => {
        try {
            const { data } = await adminAxios.delete(`/api/admin/students/${studentId}`);
            if (data.success) {
                toast.success('Student removed successfully');
                fetchStudents();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to remove student');
        }
    };

    // Fetch all transactions
    const fetchTransactions = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/transactions');
            if (data.success) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            toast.error('Failed to fetch transactions');
        }
    };

    // Logout
    const adminLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setIsAdminAuth(false);
        setAdminData(null);
        navigate('/login');
    };

    const value = {
        isAdminAuth,
        adminData,
        loading,
        dashboardStats,
        educators,
        courses,
        students,
        transactions,
        fetchDashboardStats,
        fetchEducators,
        removeEducator,
        fetchCourses,
        updateCourse,
        deleteCourse,
        toggleCoursePublish,
        fetchStudents,
        getStudentDetails,
        removeStudent,
        fetchTransactions,
        adminLogout,
        navigate
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
