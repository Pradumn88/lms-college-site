import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../../Context/AppContext.jsx';
import Footer from '../../Components/Student/Footer';

const Educators = () => {
    const { backend } = useContext(AppContext);
    const [educators, setEducators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEducators = async () => {
            try {
                const { data } = await axios.get(`${backend}/api/user/educators`);
                if (data.success) {
                    setEducators(data.educators);
                }
            } catch (error) {
                console.error('Error fetching educators:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEducators();
    }, []);

    const filteredEducators = educators.filter(edu =>
        edu.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-6xl mx-auto px-4 py-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Our Educators</h1>
                        <p className="text-gray-400 mt-2">Browse courses from expert instructors</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search educators..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                </div>

                {filteredEducators.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <span className="text-6xl mb-4 block">👨‍🏫</span>
                        <p className="text-gray-400 text-xl">No educators found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEducators.map((educator, index) => (
                            <motion.div
                                key={educator._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={`/educators/${educator._id}`}>
                                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                                {educator.name?.charAt(0)?.toUpperCase() || 'E'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{educator.name}</h3>
                                                <p className="text-gray-500 text-sm">{educator.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-400">📚</span>
                                                <span className="text-gray-400 text-sm">{educator.courseCount} courses</span>
                                            </div>
                                            <span className="text-purple-400 text-sm font-medium">View Courses →</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Educators;
