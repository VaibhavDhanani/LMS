import Course from '../models/course.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
// Create a new course
export const createCourse = async (req, res) => {
  try {
    // Find the user who is creating the course
    const user = await User.findById(req.body.teacherId);

    // Check if user exists and is verified
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is actually a teacher
    if (!user.isTeacher) {
      return res.status(403).json({
        error: 'Only teachers can create courses',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Only verified teachers can create courses',
      });
    }

    // If all checks pass, create the course
    const course = await Course.create(req.body);

    // Optionally, add the course to the teacher's created courses
    user.createdCourses = user.createdCourses || [];
    user.createdCourses.push(course._id);
    await user.save();

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {

  try {
    const courses = await Course.find()
        .populate({
          path: "instructor",
          select: "name email profilePicture reviews",
        })
        .populate({
          path: "reviews",
          select: "rating comment user",
        });

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }
    res.status(200).json({ message: "success", data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
        .populate({
          path: "instructor",
          select: "name email profilePicture reviews biography",
        })
        .populate({
          path: "reviews",
          select: "rating content",
        });

    if (!course) return res.status(404).json({ message: "Course not found" });
    // console.log(course);
    res.status(200).json({message: "success", data: course});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getInstructorCourse =async(req, res) => {
    const { id } = req.params; // Destructure the instructor directly
    const { isActive } = req.query; // Capture query params
    try {
      let query = {
        instructor: id, 
    };
      if (isActive !== undefined) {
        query.isActive = isActive === "true"; // Convert to boolean
      } 
      const courses = await Course.find(query ) // Query using the instructorId
      .populate("instructor", "name email profilePicture review")
      .populate("reviews", "rating content");

     if(!courses) return  res.status(404).json({ message: "Course not found" });

     res.status(200).json({data: courses});
  }catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const getStudentCourse = async (req, res) => {
  try {
    const { id: studentId } = req.params; // Get student ID from request parameters

    // Find the student and populate the enrolledCourses array
    const student = await User.findById(studentId)
      .populate({
        path: "enrolledCourses", // Populate the enrolledCourses field
        populate: [
          { path: "instructor", select: "name email profilePicture review biography" }, // Populate instructor details
          { path: "reviews", select: "rating content" }, // Populate reviews
        ],
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Return the populated enrolled courses
    res.status(200).json({ data: student.enrolledCourses });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({ error: error.message });
  }
};


// Update a course
export const updateCourse = async (req, res) => {
  try {
    // Update the course
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      updatedAt: new Date() 
    });

    // If the course is not found
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Return the updated course
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Find the course first to get the teacherId
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find the teacher who created the course
    const teacher = await User.findById(course.teacherId);
    if (!teacher)
      return res.status(404).json({ message: 'Course creator not found' });

    // Remove the course from the teacher's createdCourses array
    teacher.createdCourses = teacher.createdCourses.filter(
      (id) => id.toString() !== courseId,
    );
    await teacher.save();

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      message: 'Course deleted successfully from created courses',
    });
  } catch (error) {
    console.error('Course Deletion Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCourseStatus = async(req,res)=>{
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, message: "Course status updated", data: updatedCourse });
  } catch (error) {
    console.error("Error updating course status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}