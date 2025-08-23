import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../Components/Student/Loading';

const EditCourse = () => {
  const { backend, getToken } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backend}/api/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCourse(data.courseData || {}); // safe default
      } else {
        toast.error(data.message || 'Course not found');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.put(`${backend}/api/course/${id}`, course, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success('Course updated successfully');
        navigate('/educator/my-courses');
      } else {
        toast.error(data.message || 'Failed to update course');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <Loading />;

  if (!course || !course._id) {
    return <div className="text-center text-red-500 mt-10">Course not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Course</h2>

      <div className="space-y-4">
        <input
          type="text"
          value={course.courseTitle || ''}
          onChange={(e) => setCourse({ ...course, courseTitle: e.target.value })}
          className="w-full border p-2 rounded"
          placeholder="Course Title"
        />

        <textarea
          value={course.courseDescription || ''}
          onChange={(e) => setCourse({ ...course, courseDescription: e.target.value })}
          className="w-full border p-2 rounded"
          placeholder="Course Description"
        />

        <input
          type="number"
          value={course.coursePrice || 0}
          onChange={(e) => setCourse({ ...course, coursePrice: Number(e.target.value) })}
          className="w-full border p-2 rounded"
          placeholder="Course Price"
        />

        <input
          type="number"
          value={course.discount || 0}
          onChange={(e) => setCourse({ ...course, discount: Number(e.target.value) })}
          className="w-full border p-2 rounded"
          placeholder="Discount (%)"
        />

        {/* Safely loop over courseContent */}
        <div>
          <h3 className="font-medium mb-2">Course Content</h3>
          {(course.courseContent || []).map((chapter, cIndex) => (
            <div key={cIndex} className="mb-4 border p-3 rounded">
              <input
                type="text"
                value={chapter.chapterTitle || ''}
                onChange={(e) => {
                  const newContent = [...(course.courseContent || [])];
                  newContent[cIndex].chapterTitle = e.target.value;
                  setCourse({ ...course, courseContent: newContent });
                }}
                className="w-full border p-2 rounded mb-2"
                placeholder="Chapter Title"
              />

              <div className="ml-4">
                {(chapter.chapterContent || []).map((lecture, lIndex) => (
                  <div key={lIndex} className="mb-2">
                    <input
                      type="text"
                      value={lecture.lectureTitle || ''}
                      onChange={(e) => {
                        const newContent = [...(course.courseContent || [])];
                        newContent[cIndex].chapterContent[lIndex].lectureTitle = e.target.value;
                        setCourse({ ...course, courseContent: newContent });
                      }}
                      className="w-full border p-2 rounded mb-1"
                      placeholder="Lecture Title"
                    />

                    <input
                      type="text"
                      value={lecture.lectureUrl || ''}
                      onChange={(e) => {
                        const newContent = [...(course.courseContent || [])];
                        newContent[cIndex].chapterContent[lIndex].lectureUrl = e.target.value;
                        setCourse({ ...course, courseContent: newContent });
                      }}
                      className="w-full border p-2 rounded"
                      placeholder="Lecture URL"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={updateCourse}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditCourse;
