import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../Context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../Components/Student/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyEnrollments = () => {
  const { enrolledCourses = [], calculateCourseDuration, navigate, backend, getToken, calculateNoofLectures } = useContext(AppContext)
  const [progressArray, setProgressArray] = useState([])
  const [loading, setLoading] = useState(true)
  const [refundingId, setRefundingId] = useState(null)

  const getCourseProgress = async () => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const { data } = await axios.post(`${backend}/api/user/get-course-progress`,
              { courseId: course._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const totalLectures = calculateNoofLectures(course);
            const lecturesCompleted = data?.progressData?.lectureCompleted?.length || 0;
            return { totalLectures, lecturesCompleted };
          } catch (err) {
            return { totalLectures: 0, lecturesCompleted: 0 };
          }
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const requestRefund = async (courseId) => {
    if (!window.confirm('Are you sure you want to request a refund?')) return;
    setRefundingId(courseId);
    try {
      const token = await getToken();
      const { data: historyData } = await axios.get(`${backend}/api/user/payment-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyData.success) {
        const purchase = historyData.paymentHistory.find(p =>
          p.course?._id === courseId && p.status === 'Completed' && !p.refundStatus
        );
        if (!purchase) {
          toast.error('No refundable purchase found');
          return;
        }
        const { data } = await axios.post(`${backend}/api/user/request-refund`,
          { purchaseId: purchase._id, reason: 'User requested refund' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) toast.success('Refund request submitted');
        else toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRefundingId(null);
    }
  }

  useEffect(() => {
    getCourseProgress();
  }, [enrolledCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-3xl font-bold text-white mb-4">My Enrollments</h1>
        <p className="text-gray-400 mb-6">You haven't enrolled in any courses yet</p>
        <button
          onClick={() => navigate('/Course-List')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className='md:px-36 px-8 pt-24 pb-16'>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className='text-4xl font-bold text-white'>My Enrollments</h1>
            <p className='text-gray-400 mt-2'>{enrolledCourses.length} courses enrolled</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-slate-800/50 border border-white/10 text-white rounded-xl hover:bg-slate-700/50"
          >
            View Dashboard →
          </button>
        </div>

        <div className="grid gap-4">
          {enrolledCourses.map((course, index) => {
            const progress = progressArray[index];
            const percent = progress ? (progress.lecturesCompleted / progress.totalLectures) * 100 : 0;
            const isCompleted = progress && progress.lecturesCompleted === progress.totalLectures;

            return (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                <img
                  src={course.thumbnail}
                  alt={course.courseTitle}
                  className='w-full md:w-48 h-28 object-cover rounded-xl'
                />
                <div className='flex-1 w-full'>
                  <h3 className='text-xl font-semibold text-white mb-2'>{course.courseTitle}</h3>
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                    <span>⏱️ {calculateCourseDuration(course)}</span>
                    <span>📹 {progress?.lecturesCompleted || 0} / {progress?.totalLectures || 0} lectures</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm">{Math.round(percent)}% complete</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className='px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90'
                    onClick={() => navigate('/player/' + course._id)}
                  >
                    {isCompleted ? '✓ Completed' : percent > 0 ? 'Continue' : 'Start Learning'}
                  </button>
                  <button
                    className='px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 disabled:opacity-50'
                    onClick={() => requestRefund(course._id)}
                    disabled={refundingId === course._id}
                  >
                    {refundingId === course._id ? 'Processing...' : 'Request Refund'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MyEnrollments
