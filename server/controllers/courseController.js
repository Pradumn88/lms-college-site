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