import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../Components/Student/Loading';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { backend, getToken } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseDescription: '',
    courseThumbnail: '',
    coursePrice: '',
    discount: ''
  });

  const fetchCourseDetails = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backend}/api/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCourse(data.courseData);
        setFormData({
          courseTitle: data.courseData.courseTitle,
          courseDescription: data.courseData.courseDescription,
          courseThumbnail: data.courseData.courseThumbnail,
          coursePrice: data.courseData.coursePrice,
          discount: data.courseData.discount
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.patch(`${backend}/api/course/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success('Course updated successfully');
        navigate('/educator/my-courses');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input type="text" name="courseTitle" value={formData.courseTitle} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea name="courseDescription" value={formData.courseDescription} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block font-medium">Thumbnail URL</label>
          <input type="text" name="courseThumbnail" value={formData.courseThumbnail} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Price</label>
          <input type="number" name="coursePrice" value={formData.coursePrice} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block font-medium">Discount (%)</label>
          <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Course</button>
      </form>
    </div>
  );
};

export default EditCourse;
