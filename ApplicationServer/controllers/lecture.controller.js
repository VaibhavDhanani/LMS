import Lecture from "../models/Lecture.js"; // Assuming Lecture model is defined
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // Used for generating room tokens
import User from "../models/user.js";
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

// ✅ Create Lecture (Checks for conflicts)
export const createLecture = async (req, res) => {
  try {
    const { title, date, startTime, duration, description, courseId, instructorId } = req.body;

    if (!title || !date || !startTime || !duration || !courseId || !instructorId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if a lecture exists for the same teacher at the same time
    const existingLecture = await Lecture.findOne({ instructorId, date, startTime });

    if (existingLecture) {
      return res.status(400).json({ message: "Lecture already scheduled for this time." });
    }

    const newLecture = new Lecture({
      title,
      date,
      startTime,
      duration,
      description,
      courseId,
      instructorId,
      status: "scheduled", // Default status
    });

    await newLecture.save();
    res.status(201).json(newLecture);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Get Lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Get Lectures by Instructor ID
export const getInstructorLecture = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Instructor ID" });
    }

    const lectures = await Lecture.find({ instructorId: id });
    res.status(200).json({ data: lectures });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getStudentLecture = async (req, res) => {
  try {
    const { id } = req.params; // Student ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Student ID" });
    }

    // Find the student and get their enrolled courses
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrolledCourses = student.enrolledCourses; // Array of course IDs

    if (!enrolledCourses || enrolledCourses.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Fetch lectures that belong to the enrolled courses
    const lectures = await Lecture.find({ courseId: { $in: enrolledCourses } });

    res.status(200).json({ data: lectures });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Update Lecture (Doesn't override status/roomToken unless provided)
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, startTime, duration, description, courseId, instructorId, status, roomToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      { title, date, startTime, duration, description, courseId, instructorId, ...(status && { status }), ...(roomToken && { roomToken }) },
      { new: true, runValidators: true }
    );

    if (!updatedLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Delete Lecture
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    const deletedLecture = await Lecture.findByIdAndDelete(id);
    if (!deletedLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Start Lecture (Generates room token)

export const startLecture = async (req, res) => {
  try {
    const { id } = req.params;
    // const userId = req.user.id; // Extracted from auth middleware

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    // Fetch the lecture
    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Ensure the user is the instructor of the course
    // const course = await Course.findById(lecture.courseId);
    // if (!course) {
    //   return res.status(404).json({ message: "Course not found" });
    // }

    // if (course.instructorId.toString() !== userId) {
    //   return res.status(403).json({ message: "Unauthorized: You are not the instructor of this course." });
    // }

    // If lecture is already ongoing, return the existing token
    if (lecture.status === "ongoing") {
      return res.status(200).json({ message: "Lecture is already ongoing", roomToken: lecture.roomToken });
    }

    // Generate a unique JWT-based room token
    const roomToken = jwt.sign(
      { lectureId: id, 
        // instructorId: userId 
      },
      SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Update lecture status and token
    lecture.status = "ongoing";
    lecture.roomToken = roomToken;
    await lecture.save();

    res.status(200).json({ message: "Lecture started", roomToken });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ✅ Student Joins Lecture (Fetches room token)
export const joinLecture = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lecture.status !== "ongoing") {
      return res.status(400).json({ message: "Lecture has not started yet." });
    }

    res.status(200).json({ roomToken: lecture.roomToken });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
