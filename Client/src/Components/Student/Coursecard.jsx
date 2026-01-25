import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../Context/AppContext'
import { Link } from 'react-router-dom'

const Coursecard = ({ course }) => {
  const { currency, calculateRatings } = useContext(AppContext)

  if (!course) return null

  const rating = calculateRatings(course)
  const discountedPrice = (course.coursePrice && course.discount !== undefined)
    ? (course.coursePrice - (course.discount * course.coursePrice) / 100).toFixed(2)
    : '0.00'

  return (
    <Link
      to={'/course/' + (course._id || '')}
      onClick={() => scrollTo(0, 0)}
      className='group bg-white backdrop-blur-sm border border-black/70 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300'
    >
      {/* Thumbnail */}
      <div className="relative w-full h-32 overflow-hidden">
        <img
          src={course.thumbnail || assets.course_1}
          alt={course.courseTitle || 'Course'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.discount > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">
            {course.discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-black line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors'>
          {course.courseTitle || 'Untitled Course'}
        </h3>

        <p className='text-black-400 text-sm mb-3'>
          by {(course.educator && course.educator.name) ? course.educator.name : 'Unknown'}
        </p>

        {/* Rating */}
        <div className='flex items-center gap-2 mb-3'>
          <span className='text-yellow-400 font-semibold'>{rating}</span>
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                viewBox="0 0 24 24"
                fill={index < Math.floor(rating) ? '#ce9709ff' : 'none'}
                stroke={index < Math.floor(rating) ? '#ce9709ff' : 'black'}
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className='text-gray-500 text-sm'>
            ({course.courseRatings?.length || 0})
          </span>
        </div>

        {/* Price */}
        <div className='flex items-center gap-2'>
          <span className='text-xl font-bold text-black'>
            {currency}{discountedPrice}
          </span>
          {course.discount > 0 && (
            <span className='text-black line-through text-sm'>
              {currency}{course.coursePrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Coursecard