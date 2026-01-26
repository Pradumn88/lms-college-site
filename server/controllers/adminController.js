import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/user.js';
import Course from '../models/course.js';
import { Purchase } from '../models/Purchase.js';
import { clerkClient } from '@clerk/express';
import connectDB from '../configs/mongodb.js';

// Initialize default admin if not exists
const initializeAdmin = async () => {
    try {
        await connectDB();
        const existingAdmin = await Admin.findOne({ email: 'krishnabhambani1@gmail.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('Krishna@2004', 10);
            await Admin.create({
                email: 'krishnabhambani1@gmail.com',
                password: hashedPassword,
                name: 'Krishna Admin'
            });
            console.log('Default admin created');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};

// Call initialization
initializeAdmin();

// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        await connectDB();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET || 'admin-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify Admin Token
export const verifyAdmin = async (req, res) => {
    try {
        await connectDB();
        res.json({
            success: true,
            admin: req.admin
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==================== EDUCATOR MANAGEMENT ====================

// Get all educators
export const getAllEducators = async (req, res) => {
    try {
        await connectDB();
        // Get all users who are educators from Clerk
        const users = await clerkClient.users.getUserList({ limit: 100 });
        const educators = users.data.filter(user => user.publicMetadata?.role === 'educator');

        // Get course counts for each educator
        const educatorsWithCourses = await Promise.all(
            educators.map(async (educator) => {
                const courseCount = await Course.countDocuments({ educator: educator.id });
                return {
                    id: educator.id,
                    email: educator.emailAddresses[0]?.emailAddress,
                    name: `${educator.firstName || ''} ${educator.lastName || ''}`.trim() || 'N/A',
                    imageUrl: educator.imageUrl,
                    courseCount,
                    createdAt: educator.createdAt
                };
            })
        );

        res.json({ success: true, educators: educatorsWithCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove educator role (demote to regular user)
export const removeEducator = async (req, res) => {
    try {
        await connectDB();
        const { educatorId } = req.params;

        await clerkClient.users.updateUser(educatorId, {
            publicMetadata: { role: null }
        });

        res.json({ success: true, message: 'Educator role removed successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==================== COURSE MANAGEMENT ====================

// Get all courses with educator info
export const getAllCoursesAdmin = async (req, res) => {
    try {
        await connectDB();
        const courses = await Course.find({}).sort({ createdAt: -1 });

        // Enrich with educator info
        const coursesWithEducator = await Promise.all(
            courses.map(async (course) => {
                let educatorInfo = { name: 'Unknown', email: 'N/A' };
                try {
                    const educator = await clerkClient.users.getUser(course.educator);
                    educatorInfo = {
                        name: `${educator.firstName || ''} ${educator.lastName || ''}`.trim() || 'N/A',
                        email: educator.emailAddresses[0]?.emailAddress || 'N/A'
                    };
                } catch (e) {
                    // Educator might not exist
                }

                return {
                    ...course.toObject(),
                    educatorInfo,
                    enrolledCount: course.enrolledStudents?.length || 0
                };
            })
        );

        res.json({ success: true, courses: coursesWithEducator });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update course
export const updateCourseAdmin = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;
        const updateData = req.body;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { new: true }
        );

        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        res.json({ success: true, message: 'Course updated successfully', course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete course
export const deleteCourseAdmin = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;

        const course = await Course.findByIdAndDelete(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // Also remove course from all users' enrolledCourses
        await User.updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } }
        );

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Toggle course publish status
export const toggleCoursePublish = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        course.isPublished = !course.isPublished;
        await course.save();

        res.json({
            success: true,
            message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
            isPublished: course.isPublished
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==================== STUDENT MANAGEMENT ====================

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        await connectDB();
        const students = await User.find({}).populate('enrolledCourses').sort({ createdAt: -1 });

        const studentsWithPurchases = await Promise.all(
            students.map(async (student) => {
                const purchases = await Purchase.find({ userId: student._id })
                    .populate('courseId')
                    .sort({ createdAt: -1 });

                const totalSpent = purchases
                    .filter(p => p.status === 'Completed')
                    .reduce((sum, p) => sum + p.amount, 0);

                return {
                    ...student.toObject(),
                    purchaseCount: purchases.length,
                    totalSpent,
                    enrolledCount: student.enrolledCourses?.length || 0
                };
            })
        );

        res.json({ success: true, students: studentsWithPurchases });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get student details with purchase history
export const getStudentDetails = async (req, res) => {
    try {
        await connectDB();
        const { studentId } = req.params;

        const student = await User.findById(studentId).populate('enrolledCourses');
        if (!student) {
            return res.json({ success: false, message: 'Student not found' });
        }

        const purchases = await Purchase.find({ userId: studentId })
            .populate('courseId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            student: student.toObject(),
            purchases
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove student (delete from system)
export const removeStudent = async (req, res) => {
    try {
        await connectDB();
        const { studentId } = req.params;

        // Delete user from MongoDB
        const student = await User.findByIdAndDelete(studentId);
        if (!student) {
            return res.json({ success: false, message: 'Student not found' });
        }

        // Remove student from all course enrolledStudents
        await Course.updateMany(
            { enrolledStudents: studentId },
            { $pull: { enrolledStudents: studentId } }
        );

        // Try to delete from Clerk as well
        try {
            await clerkClient.users.deleteUser(studentId);
        } catch (e) {
            console.log('Could not delete from Clerk:', e.message);
        }

        res.json({ success: true, message: 'Student removed successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==================== TRANSACTIONS & ANALYTICS ====================

// Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        await connectDB();
        const purchases = await Purchase.find({})
            .populate('courseId')
            .sort({ createdAt: -1 });

        // Enrich with user info
        const transactionsWithUser = await Promise.all(
            purchases.map(async (purchase) => {
                let userInfo = { name: 'Unknown', email: 'N/A' };
                try {
                    const user = await User.findById(purchase.userId);
                    if (user) {
                        userInfo = { name: user.name, email: user.email };
                    }
                } catch (e) { }

                return {
                    ...purchase.toObject(),
                    userInfo,
                    courseName: purchase.courseId?.courseTitle || 'Deleted Course'
                };
            })
        );

        res.json({ success: true, transactions: transactionsWithUser });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        await connectDB();
        const totalStudents = await User.countDocuments();
        const totalCourses = await Course.countDocuments();

        // Get educator count from Clerk
        const users = await clerkClient.users.getUserList({ limit: 100 });
        const totalEducators = users.data.filter(u => u.publicMetadata?.role === 'educator').length;

        const completedPurchases = await Purchase.find({ status: 'Completed' });
        const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);
        const totalTransactions = await Purchase.countDocuments();

        // Recent activity
        const recentStudents = await User.find({}).sort({ createdAt: -1 }).limit(5);
        const recentTransactions = await Purchase.find({})
            .populate('courseId')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalStudents,
                totalCourses,
                totalEducators,
                totalRevenue,
                totalTransactions
            },
            recentStudents,
            recentTransactions
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// Call initialization
initializeAdmin();