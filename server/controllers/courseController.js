import Course from "../models/course.js";

//get all courses
export const getAllCourses = async (req,res)=>{
    try {
        const courses = await Course.find({isPublished: true}).select
        (['-couseContent', '-enrolledStudents']).populate
        ({path: 'educator'})

        res.json({ success: true, courses})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

//get course by if

export const getCourseId = async (req,res)=>{
    const {id} = req.params

    try {
        const courseData = await Course.findById(id).populate({path: 'educator'})

        // Remove lectureUrl if isPreview is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })
        res.json({ success: true, courseData})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// create a new course
export const createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// update an existing course by ID
export const updateCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.json({ success: true, course: updatedCourse });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// delete a course by ID
export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
