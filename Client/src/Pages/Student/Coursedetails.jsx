import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../Context/AppContext';
import Loading from '../../Components/Student/Loading';
import humanizeDuration from 'humanize-duration';
import Footer from '../../Components/Student/Footer'
import YouTube from 'react-youtube'
import { toast } from 'react-toastify';
import axios from 'axios';
import PaymentMethodModal from '../../Components/PaymentMethodModal';

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    if (hostname.includes('youtube.com')) {
      if (urlObject.pathname.includes('/embed/')) {
        videoId = urlObject.pathname.split('/embed/')[1].split(/[?#]/)[0];
      } else {
        videoId = urlObject.searchParams.get('v');
      }
    } else if (hostname.includes('youtu.be')) {
      videoId = urlObject.pathname.substring(1).split(/[?#]/)[0];
    }
  } catch (error) {
    if (typeof url === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  }
  return videoId;
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StarRating = ({ rating, setRating, readonly = false, size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly} onClick={() => !readonly && setRating(star)}
          className={`${sizes[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
          <svg viewBox="0 0 24 24" fill={star <= rating ? '#FBBF24' : 'none'} stroke={star <= rating ? '#FBBF24' : '#6B7280'} strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const Coursedetails = () => {
  const { id } = useParams();
  const { allCourses, calculateCourseDuration, calculateChapterTime, calculateNoofLectures, currency, backend, userData, getToken, navigate } = useContext(AppContext)

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [courseForPayment, setCourseForPayment] = useState(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ total: 0, average: 0 })
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const fetchCourseData = async () => {
    try {
      const response = await axios.get(backend + '/api/course/' + id);
      if (response.data?.success && response.data.courseData) setCourseData(response.data.courseData);
      else {
        const fallback = allCourses?.find(c => c._id === id);
        if (fallback) setCourseData(fallback);
      }
    } catch (error) {
      const fallback = allCourses?.find(c => c._id === id);
      if (fallback) setCourseData(fallback);
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${backend}/api/course/${id}/reviews`);
      if (data.success) { setReviews(data.reviews || []); setReviewStats(data.stats || { total: 0, average: 0 }); }
    } catch (error) { console.error('Failed to fetch reviews'); }
  }

  const submitReview = async () => {
    if (!userData) return toast.warn('Please login');
    if (!isAlreadyEnrolled) return toast.warn('Enroll to review');
    setSubmittingReview(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(`${backend}/api/course/${id}/review`, { rating: newReview.rating, comment: newReview.comment }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { toast.success('Review submitted!'); setNewReview({ rating: 5, comment: '' }); fetchReviews(); }
      else toast.error(data.message);
    } catch (error) { toast.error('Failed'); }
    finally { setSubmittingReview(false); }
  }

  const enrollCourse = async () => {
    if (!userData) { toast.warn('Please login'); navigate('/login'); return; }
    if (isAlreadyEnrolled) { toast.warn('Already Enrolled'); return; }
    setCourseForPayment({ id: courseData._id, title: courseData.courseTitle, thumbnail: courseData.thumbnail, price: courseData.coursePrice, discount: courseData.discount, finalAmount: (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)) });
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    setPaymentLoading(true);
    try {
      const token = await getToken();
      if (!token) { toast.error('Login again'); setShowPaymentModal(false); return; }
      if (method === 'stripe') {
        const { data } = await axios.post(`${backend}/api/user/purchase/stripe`, { courseId: courseData._id }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success && data.session_url) window.location.replace(data.session_url);
        else toast.error(data.message || 'Failed');
      } else if (method === 'razorpay') {
        await loadRazorpayScript();
        const { data } = await axios.post(`${backend}/api/user/purchase/razorpay`, { courseId: courseData._id }, { headers: { Authorization: `Bearer ${token}` } });
        if (!data.success) { toast.error(data.message); return; }
        new window.Razorpay({
          key: data.key, amount: data.order.amount, currency: data.order.currency, name: 'AIM Learning', order_id: data.order.id,
          handler: async (response) => {
            const verifyData = await axios.post(`${backend}/api/user/purchase/razorpay/verify`, { ...response, purchaseId: data.purchaseId }, { headers: { Authorization: `Bearer ${token}` } });
            if (verifyData.data.success) { toast.success('Success!'); navigate('/my-enrollments'); }
          },
          prefill: { name: data.user.name, email: data.user.email }, theme: { color: '#8B5CF6' }
        }).open();
      }
    } catch (error) { toast.error('Failed'); }
    finally { setPaymentLoading(false); setShowPaymentModal(false); }
  };

  useEffect(() => { fetchCourseData(); fetchReviews(); }, [id])
  useEffect(() => { if (userData && courseData) setIsAlreadyEnrolled(userData.enrolledCourses?.includes(courseData._id)) }, [userData, courseData])

  const toggleSection = (index) => setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleLectureClick = (chapterIndex, lectureIndex) => {
    const lecture = courseData.courseContent[chapterIndex]?.chapterContent[lectureIndex];
    if (!lecture) return;
    if (isAlreadyEnrolled || lecture.isPreviewFree) {
      const videoId = getYouTubeVideoId(lecture.lectureUrl);
      if (videoId) { setCurrentlyPlaying({ videoId, chapterIndex, lectureIndex, title: lecture.lectureTitle }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } else toast.info("Enroll to watch");
  };

  const playNextLecture = () => {
    if (!courseData || !currentlyPlaying) return;
    let { chapterIndex, lectureIndex } = currentlyPlaying;
    let next = lectureIndex + 1, nextCh = chapterIndex;
    if (!courseData.courseContent[nextCh]?.chapterContent[next]) { nextCh++; next = 0; }
    if (courseData.courseContent[nextCh]?.chapterContent[next]) handleLectureClick(nextCh, next);
  };

  const playPrevLecture = () => {
    if (!courseData || !currentlyPlaying) return;
    let { chapterIndex, lectureIndex } = currentlyPlaying;
    let prev = lectureIndex - 1, prevCh = chapterIndex;
    if (prev < 0) { prevCh--; if (prevCh >= 0) prev = (courseData.courseContent[prevCh]?.chapterContent.length || 1) - 1; }
    if (courseData.courseContent[prevCh]?.chapterContent[prev]) handleLectureClick(prevCh, prev);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (!courseData) return <Loading />;

  const discountedPrice = (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section with Course Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left - Course Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigate('/')}>Home</span>
              <span>/</span>
              <span className="hover:text-purple-400 cursor-pointer" onClick={() => navigate('/Course-List')}>Courses</span>
              <span>/</span>
              <span className="text-purple-400">{courseData.courseTitle?.slice(0, 30)}...</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{courseData.courseTitle}</h1>
            <div className="text-gray-300 text-lg" dangerouslySetInnerHTML={{ __html: courseData.courseDescription?.slice(0, 300) + '...' }} />

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <StarRating rating={parseFloat(reviewStats.average) || 0} readonly size="sm" />
                <span className="text-yellow-400 font-semibold">{reviewStats.average}</span>
                <span className="text-gray-400">({reviewStats.total} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>👥</span><span>{courseData.enrolledStudents?.length || 0} students</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span>🎓</span><span>by {courseData.educator?.name || 'Unknown'}</span>
              </div>
            </div>

            {currentlyPlaying && (
              <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                <YouTube videoId={currentlyPlaying.videoId} opts={{ playerVars: { autoplay: 1 }, width: '100%' }} iframeClassName="w-full aspect-video" onEnd={playNextLecture} />
                <div className="flex justify-between items-center p-4 bg-slate-800/80">
                  <button onClick={playPrevLecture} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">← Prev</button>
                  <p className="text-white font-medium">{currentlyPlaying.title}</p>
                  <button onClick={playNextLecture} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Right - Course Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {!currentlyPlaying && (courseData.thumbnail ? <img src={courseData.thumbnail} alt="" className="w-full aspect-video object-cover" /> : <div className="w-full aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"><span className="text-white text-4xl">📚</span></div>)}
              <div className="p-6 space-y-4">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white">{currency}{discountedPrice}</span>
                  {courseData.discount > 0 && (<><span className="text-xl text-gray-500 line-through">{currency}{courseData.coursePrice}</span><span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">{courseData.discount}% OFF</span></>)}
                </div>
                <button onClick={enrollCourse} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isAlreadyEnrolled ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30'}`}>
                  {isAlreadyEnrolled ? '✓ Enrolled' : '🚀 Enroll Now'}
                </button>
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2"><span className="text-purple-400">📹</span>{calculateNoofLectures(courseData)} lectures</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400">⏱️</span>{calculateCourseDuration(courseData)} duration</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400">📱</span>Mobile access</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400">🏆</span>Certificate</li>
                    <li className="flex items-center gap-2"><span className="text-purple-400">♾️</span>Lifetime access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-3xl">📖</span> Course Content</h2>
            <p className="text-gray-400 mt-2">{courseData.courseContent?.length || 0} chapters • {calculateNoofLectures(courseData)} lectures • {calculateCourseDuration(courseData)}</p>
          </div>
          <div className="divide-y divide-white/5">
            {(courseData.courseContent || []).map((chapter, index) => (
              <div key={index}>
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/5" onClick={() => toggleSection(index)}>
                  <div className="flex items-center gap-3">
                    <span className={`text-purple-400 transition-transform ${openSections[index] ? 'rotate-90' : ''}`}>▶</span>
                    <span className="text-white font-medium">{chapter.chapterTitle}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{chapter.chapterContent?.length || 0} lectures • {calculateChapterTime(chapter)}</span>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                  <ul className="bg-slate-900/50 px-6 py-2">
                    {(chapter.chapterContent || []).map((lecture, i) => (
                      <li key={i} onClick={() => handleLectureClick(index, i)} className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition-all ${currentlyPlaying?.chapterIndex === index && currentlyPlaying?.lectureIndex === i ? 'bg-purple-600/30 border border-purple-500/50' : 'hover:bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">▶️</span>
                          <span className="text-gray-200">{lecture.lectureTitle}</span>
                          {lecture.isPreviewFree && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Preview</span>}
                        </div>
                        <span className="text-gray-500 text-sm">{humanizeDuration((lecture.lectureDuration || 0) * 60 * 1000, { units: ['h', 'm'] })}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section - FULL WIDTH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Reviews Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span className="text-3xl">⭐</span> Student Reviews</h2>
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400">{reviewStats.average}</div>
                <StarRating rating={parseFloat(reviewStats.average) || 0} readonly />
                <p className="text-gray-400 text-sm mt-1">{reviewStats.total} reviews</p>
              </div>
            </div>
          </div>

          {/* Write Review */}
          <div className="p-6 border-b border-white/10 bg-slate-900/30">
            <h3 className="text-white font-semibold mb-4">Write a Review</h3>
            {isAlreadyEnrolled ? (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300">Your Rating:</span>
                  <StarRating rating={newReview.rating} setRating={(r) => setNewReview({ ...newReview, rating: r })} size="lg" />
                </div>
                <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Share your experience with this course..." className="w-full bg-slate-800 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" rows={3} />
                <button onClick={submitReview} disabled={submittingReview} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-gray-400 mb-4">Enroll in this course to leave a review</p>
                <button onClick={enrollCourse} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90">
                  🚀 Enroll Now to Review
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {displayedReviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8 col-span-2">No reviews yet. Be the first!</p>
              ) : (
                displayedReviews.map((review, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl p-5 border border-white/5">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-semibold">{review.userName || 'Anonymous'}</h4>
                          <span className="text-gray-500 text-sm">{formatDate(review.createdAt)}</span>
                        </div>
                        <StarRating rating={review.rating} readonly size="sm" />
                        {review.comment && <p className="text-gray-300 mt-2">{review.comment}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {reviews.length > 3 && (
              <button onClick={() => setShowAllReviews(!showAllReviews)} className="w-full py-4 mt-6 text-purple-400 hover:text-purple-300 font-semibold border-t border-white/10">
                {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentMethodModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} course={courseForPayment} onSelectMethod={handlePaymentMethodSelect} loading={paymentLoading} />
      <Footer />
    </div>
  )
}

export default Coursedetails
