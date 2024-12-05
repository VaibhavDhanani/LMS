import Enrollment from "../models/enrollment.js";
import User from "../models/user.js";
import Course from "../models/course.js";
// Create a new enrollment
export const createEnrollment = async (req, res) => {
  try {
    const { learnerId, courseId } = req.body;

    // Validate that learner and course exist
    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }

    // Check if learner is verified
    if (!learner.isVerified) {
      return res.status(403).json({ 
        error: "Only verified users can enroll in courses" 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the course is active
    if (!course.isActive) {
      return res.status(400).json({ 
        error: "This course is currently unavailable" 
      });
    }

    // Check if the learner is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({ learnerId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ error: "You are already enrolled in this course" });
    }

    // Create the enrollment
    const enrollment = await Enrollment.create({
      ...req.body,
      transactionDate: new Date() // Automatically set transaction date
    });

    // Update learner's enrolledCourses
    if (!learner.enrolledCourses.includes(courseId)) {
      learner.enrolledCourses.push(courseId);
      await learner.save();
    }

    // Update course's enrolledStudents
    if (!course.enrolledStudents.includes(learnerId)) {
      course.enrolledStudents.push(learnerId);
      await course.save();
    }

    res.status(201).json(enrollment);
  } catch (error) {
    console.error("Enrollment Creation Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all enrollments
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("courseId", "title price")
      .populate("learnerId", "name email");
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get enrollments by learner ID
export const getEnrollmentsByLearnerId = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ LearnerId: req.params.learnerId })
      .populate("courseId", "title price");
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an enrollment
export const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const deleteEnrollment = async (req, res) => {
  try {
    // Find and delete the enrollment
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const { learnerId, courseId } = enrollment;

    // Update the learner's enrolledCourses
    const learner = await User.findById(learnerId);
    if (learner) {
      learner.enrolledCourses.pull(courseId); // Remove the courseId
      await learner.save();
    }

    // Update the course's enrolledStudents
    const course = await Course.findById(courseId);
    if (course) {
      course.enrolledStudents.pull(learnerId); // Remove the learnerId
      await course.save();
    }

    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Enrollment Deletion Error:", error);
    res.status(500).json({ error: error.message });
  }
};
