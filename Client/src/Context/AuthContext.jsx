import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

// Custom hook for using auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};

export const AuthContextProvider = ({ children }) => {
    const API_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') || 'http://localhost:5000';
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Auth axios instance
    const authAxios = axios.create({
        baseURL: API_BASE,
        headers: { 'Content-Type': 'application/json' }
    });

    // Add token to requests
    authAxios.interceptors.request.use((config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    });

    // Get token helper
    const getToken = () => localStorage.getItem('token');

    // Register user
    const register = async (name, email, password, role = 'student') => {
        try {
            const { data } = await authAxios.post('/api/auth/register', {
                name, email, password, role
            });

            if (data.success && data.requiresVerification) {
                // OTP verification required
                return { success: true, requiresVerification: true, email: data.email };
            } else if (data.success && data.token) {
                // Direct registration (no OTP required)
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            const { data } = await authAxios.post('/api/auth/login', { email, password });

            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else if (data.requiresVerification) {
                return { success: false, requiresVerification: true, email: data.email, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    // Become educator
    const becomeEducator = async () => {
        try {
            const { data } = await authAxios.post('/api/auth/become-educator');

            if (data.success) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    setToken(data.token);
                }
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    // Verify token on mount
    useEffect(() => {
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await authAxios.get('/api/auth/verify');
                if (data.success) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isEducator: user?.role === 'educator',
        register,
        login,
        logout,
        becomeEducator,
        getToken,
        API_BASE
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
