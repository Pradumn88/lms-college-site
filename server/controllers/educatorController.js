import Course from '../models/course.js'
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from '../models/Purchase.js'
import User from '../models/user.js'
import connectDB from '../configs/mongodb.js';

// add new course
export const addCourse = async (req, res) => {
    try {
        await connectDB();
        const courseData = req.body;
        const educatorId = req.userId;

        if (!courseData.thumbnail) {
            return res.json({ success: false, message: 'Thumbnail not Attached' });
        }

        await Course.create({ ...courseData, educator: educatorId });

        res.json({ success: true, message: 'Course Added' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        await connectDB();
        const educator = req.userId

        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update course
export const updateCourse = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;
        const educatorId = req.userId;
        const updateData = req.body;

        const course = await Course.findOne({ _id: courseId, educator: educatorId });

        if (!course) {
            return res.json({ success: false, message: 'Course not found or unauthorized' });
        }

        // Update allowed fields
        if (updateData.courseTitle) course.courseTitle = updateData.courseTitle;
        if (updateData.courseDescription) course.courseDescription = updateData.courseDescription;
        if (updateData.coursePrice !== undefined) course.coursePrice = updateData.coursePrice;
        if (updateData.discount !== undefined) course.discount = updateData.discount;
        if (updateData.isPublished !== undefined) course.isPublished = updateData.isPublished;
        if (updateData.thumbnail) course.thumbnail = updateData.thumbnail;

        await course.save();

        res.json({ success: true, message: 'Course updated successfully', course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;
        const educatorId = req.userId;

        const course = await Course.findOne({ _id: courseId, educator: educatorId });

        if (!course) {
            return res.json({ success: false, message: 'Course not found or unauthorized' });
        }

        // Remove course from all users' enrolledCourses
        await User.updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } }
        );

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get course-specific enrolled students
export const getCourseStudents = async (req, res) => {
    try {
        await connectDB();
        const { courseId } = req.params;
        const educatorId = req.userId;

        const course = await Course.findOne({ _id: courseId, educator: educatorId });

        if (!course) {
            return res.json({ success: false, message: 'Course not found or unauthorized' });
        }

        const students = await User.find({
            _id: { $in: course.enrolledStudents }
        }).select('name email imageUrl');

        const purchases = await Purchase.find({
            courseId,
            status: 'Completed'
        });

        const studentsWithPurchase = students.map(student => {
            const purchase = purchases.find(p => p.userId.toString() === student._id.toString());
            return {
                ...student.toObject(),
                purchaseDate: purchase?.createdAt,
                amount: purchase?.amount
            };
        });

        res.json({ success: true, students: studentsWithPurchase });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get purchase logs for educator's courses
export const getPurchaseLogs = async (req, res) => {
    try {
        await connectDB();
        const educatorId = req.userId;

        const courses = await Course.find({ educator: educatorId });
        const courseIds = courses.map(c => c._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds }
        }).populate('courseId', 'courseTitle thumbnail').sort({ createdAt: -1 });

        // Get user details for each purchase
        const logsWithUsers = await Promise.all(
            purchases.map(async (purchase) => {
                const user = await User.findById(purchase.userId).select('name email imageUrl');
                return {
                    _id: purchase._id,
                    course: purchase.courseId,
                    user: user ? { name: user.name, email: user.email, imageUrl: user.imageUrl } : null,
                    amount: purchase.amount,
                    status: purchase.status,
                    createdAt: purchase.createdAt
                };
            })
        );

        res.json({ success: true, purchaseLogs: logsWithUsers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get educator dashboard data (total earning, enrolled students, no. of courses)
export const educatorDashboardData = async (req, res) => {
    try {
        await connectDB();
        const educator = req.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // calculate total earnings
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'Completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // collect unique enrolled student id with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        await connectDB();
        const educator = req.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'Completed'
        }).populate('courseId', 'courseTitle')

        const enrolledStudents = await Promise.all(
            purchases.map(async (purchase) => {
                const user = await User.findById(purchase.userId).select('name email imageUrl');
                return {
                    student: user,
                    courseTitle: purchase.courseId?.courseTitle,
                    purchaseDate: purchase.createdAt,
                    amount: purchase.amount
                };
            })
        );

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}