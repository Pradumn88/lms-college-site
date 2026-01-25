import User from "../models/user.js";
import { Purchase } from "../models/Purchase.js";
import { Refund } from "../models/Refund.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import Course from "../models/course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import crypto from "crypto";

// Initialize Razorpay
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// User enrolled courses with lecture link
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await User.findById(userId).populate('enrolledCourses');

        res.json({ success: true, enrolledCourses: userData?.enrolledCourses || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get payment history
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const purchases = await Purchase.find({ userId })
            .populate('courseId', 'courseTitle thumbnail coursePrice')
            .sort({ createdAt: -1 });

        // Also get refund info
        const refunds = await Refund.find({ userId });

        const history = purchases.map(purchase => {
            const refund = refunds.find(r => r.purchaseId.toString() === purchase._id.toString());
            return {
                _id: purchase._id,
                course: purchase.courseId,
                amount: purchase.amount,
                status: purchase.status,
                refundStatus: refund?.status || null,
                createdAt: purchase.createdAt
            };
        });

        res.json({ success: true, paymentHistory: history });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Request refund
export const requestRefund = async (req, res) => {
    try {
        const userId = req.userId;
        const { purchaseId, reason } = req.body;

        const purchase = await Purchase.findOne({ _id: purchaseId, userId });

        if (!purchase) {
            return res.json({ success: false, message: 'Purchase not found' });
        }

        if (purchase.status !== 'Completed') {
            return res.json({ success: false, message: 'Cannot refund non-completed purchase' });
        }

        // Check if refund already exists
        const existingRefund = await Refund.findOne({ purchaseId });
        if (existingRefund) {
            return res.json({ success: false, message: 'Refund already requested' });
        }

        const refund = await Refund.create({
            purchaseId,
            courseId: purchase.courseId,
            userId,
            amount: purchase.amount,
            reason: reason || 'No reason provided'
        });

        res.json({ success: true, message: 'Refund request submitted', refund });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Unenroll from course
export const unenrollCourse = async (req, res) => {
    try {
        const userId = req.userId;
        const { courseId } = req.body;

        // Remove course from user's enrolledCourses
        await User.findByIdAndUpdate(userId, {
            $pull: { enrolledCourses: courseId }
        });

        // Remove user from course's enrolledStudents
        await Course.findByIdAndUpdate(courseId, {
            $pull: { enrolledStudents: userId }
        });

        // Delete progress
        await CourseProgress.deleteOne({ userId, courseId });

        res.json({ success: true, message: 'Successfully unenrolled from course' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get all educators
export const getEducators = async (req, res) => {
    try {
        const educators = await User.find({ role: 'educator' }).select('name email imageUrl');

        // Get course count for each educator
        const educatorsWithCourses = await Promise.all(
            educators.map(async (educator) => {
                const courseCount = await Course.countDocuments({ educator: educator._id });
                return {
                    ...educator.toObject(),
                    courseCount
                };
            })
        );

        res.json({ success: true, educators: educatorsWithCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get educator's courses
export const getEducatorCoursesPublic = async (req, res) => {
    try {
        const { educatorId } = req.params;

        const educator = await User.findById(educatorId).select('name email imageUrl');
        if (!educator) {
            return res.json({ success: false, message: 'Educator not found' });
        }

        const courses = await Course.find({ educator: educatorId, isPublished: true });

        res.json({ success: true, educator, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get student dashboard stats
export const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).populate('enrolledCourses');
        const purchases = await Purchase.find({ userId, status: 'Completed' });
        const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);

        // Calculate overall progress
        const progresses = await CourseProgress.find({ userId });
        let totalLectures = 0;
        let completedLectures = 0;

        for (const course of user.enrolledCourses || []) {
            course.courseContent?.forEach(chapter => {
                totalLectures += chapter.chapterContent?.length || 0;
            });
        }

        progresses.forEach(p => {
            completedLectures += p.lectureCompleted?.length || 0;
        });

        const progressPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        res.json({
            success: true,
            dashboard: {
                enrolledCourses: user.enrolledCourses?.length || 0,
                totalSpent,
                completedLectures,
                totalLectures,
                progressPercentage
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Purchase course with Stripe
export const purchaseCourseStripe = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        // Check if already enrolled
        if (userData.enrolledCourses?.includes(courseId)) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        const coursePrice = Number(courseData.coursePrice) || 0;
        const discount = Number(courseData.discount) || 0;
        const amount = (coursePrice - (discount * coursePrice / 100));
        const finalAmount = isNaN(amount) ? 0 : amount;

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: finalAmount,
            paymentMethod: 'stripe'
        }

        const newPurchase = await Purchase.create(purchaseData)

        const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = (process.env.CURRENCY || 'usd').toLowerCase();

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount * 100)
            },
            quantity: 1
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Purchase course with Razorpay - Create Order
export const purchaseCourseRazorpay = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        // Check if already enrolled
        if (userData.enrolledCourses?.includes(courseId)) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        const coursePrice = Number(courseData.coursePrice) || 0;
        const discount = Number(courseData.discount) || 0;
        const amount = (coursePrice - (discount * coursePrice / 100));
        const finalAmount = isNaN(amount) ? 0 : amount;

        // Create purchase record
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: finalAmount,
            paymentMethod: 'razorpay'
        }
        const newPurchase = await Purchase.create(purchaseData)

        // Create Razorpay order (amount in paise for INR, cents for USD)
        const options = {
            amount: Math.round(finalAmount * 100), // Amount in smallest currency unit
            currency: (process.env.CURRENCY || 'INR').toUpperCase(),
            receipt: newPurchase._id.toString(),
            notes: {
                courseId: courseId.toString(),
                userId: userId.toString(),
                purchaseId: newPurchase._id.toString()
            }
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({
            success: true,
            order,
            purchaseId: newPurchase._id,
            key: process.env.RAZORPAY_KEY_ID,
            course: {
                title: courseData.courseTitle,
                thumbnail: courseData.thumbnail
            },
            user: {
                name: userData.name,
                email: userData.email
            }
        });

    } catch (error) {
        console.error('Razorpay order error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Verify Razorpay Payment
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: 'Payment verification failed' });
        }

        // Update purchase status
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.json({ success: false, message: 'Purchase not found' });
        }

        purchase.status = 'Completed';
        purchase.razorpayPaymentId = razorpay_payment_id;
        purchase.razorpayOrderId = razorpay_order_id;
        await purchase.save();

        // Enroll user in course
        await User.findByIdAndUpdate(purchase.userId, {
            $addToSet: { enrolledCourses: purchase.courseId }
        });

        // Add user to course enrolledStudents
        await Course.findByIdAndUpdate(purchase.courseId, {
            $addToSet: { enrolledStudents: purchase.userId }
        });

        res.json({ success: true, message: 'Payment verified and enrolled successfully' });

    } catch (error) {
        console.error('Razorpay verification error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Legacy purchase route (defaults to showing payment options)
export const purchaseCourse = async (req, res) => {
    // This now just validates and returns course info for payment selection
    try {
        const { courseId } = req.body
        const userId = req.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        if (userData.enrolledCourses?.includes(courseId)) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        const coursePrice = Number(courseData.coursePrice) || 0;
        const discount = Number(courseData.discount) || 0;
        const amount = (coursePrice - (discount * coursePrice / 100));

        res.json({
            success: true,
            requiresPaymentMethod: true,
            course: {
                id: courseData._id,
                title: courseData.courseTitle,
                price: coursePrice,
                discount: discount,
                finalAmount: amount,
                thumbnail: courseData.thumbnail
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update user course progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.userId
        const { courseId, lectureId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get user course progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.userId
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add user rating to course
export const addUserRating = async (req, res) => {
    const userId = req.userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course Not Found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses?.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this Course.' });
        }

        const existingRatingIndex = course.courseRatings?.findIndex(r => r.userId === userId) ?? -1;

        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            if (!course.courseRatings) course.courseRatings = [];
            course.courseRatings.push({ userId, rating });
        }
        await course.save();

        return res.json({ success: true, message: 'Rating Added' })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
