import Lecture from "../models/Lecture.js"; // Assuming Lecture model is defined
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // Used for generating room tokens
import User from "../models/user.js";
const SECRET_KEY = "your_secret_key"; // Change this to a secure key
import moment from "moment"; // Install using: npm install moment
import notificationManager from "../utills/notificationManager.js";

// ✅ Create Lecture (Checks for conflicts)

export const createLecture = async (req, res) => {
  try {
    const { title, date, startTime, duration, description, course, instructorId } = req.body;

    if (!title || !date || !startTime || !duration || !course || !instructorId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    
    const today = moment().startOf("day"); // Get today's date (00:00:00)
    const maxDate = moment().add(7, "days").endOf("day"); // Get max date (end of 7th day)
    const selectedDate = moment(date, "YYYY-MM-DD"); // Convert input date to moment format
    
    // Check if date is within today and the next 7 days
    if (!selectedDate.isBetween(today, maxDate, null, "[]")) {
      return res.status(400).json({ message: "Date must be within today and the next 7 days." });
    }

    // If selected date is today, ensure startTime is greater than the current time
    if (selectedDate.isSame(today, "day")) {
      const currentTime = moment().format("HH:mm"); // Current time in HH:mm format
      if (startTime <= currentTime) {
        return res.status(400).json({ message: "Start time must be later than the current time." });
      }
    }
    
    // Check if a lecture already exists for the instructor at the same date & time
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
      course,
      instructorId,
      status: "scheduled", // Default status
    });

    await newLecture.save();

    const notification = await notificationManager.createNotificationsForCourse(course,{
      type: 'lecture_scheduled',
      lecture : newLecture._id,
      title: newLecture.title,
      message: `A new lecture "${title}" has been scheduled for ${new Date(startTime).toLocaleString()}`,
      isTimeSensitive: false,
    });
    res.status(201).json({data : newLecture});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// ✅ Update Lecture (Doesn't override status/roomToken unless provided)
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, startTime, duration, description, course, instructorId, status, roomToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    const existingLecture = await Lecture.findById(id);
    if (!existingLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (date && startTime) {
      const today = moment().startOf("day");
      const maxDate = moment().add(7, "days").endOf("day");
      const selectedDate = moment(date, "YYYY-MM-DD");

      if (!selectedDate.isBetween(today, maxDate, null, "[]")) {
        return res.status(400).json({ message: "Date must be within today and the next 7 days." });
      }

      if (selectedDate.isSame(today, "day")) {
        const currentTime = moment().format("HH:mm");
        if (startTime <= currentTime) {
          return res.status(400).json({ message: "Start time must be later than the current time." });
        }
      }

      // Check if another lecture is already scheduled for this instructor at the same date and time
      const conflictingLecture = await Lecture.findOne({
        instructorId,
        date,
        startTime,
        _id: { $ne: id }, // Exclude the current lecture being updated
      });

      if (conflictingLecture) {
        return res.status(400).json({ message: "Lecture already scheduled for this time." });
      }
    }

    // Check if significant details have changed
    const isLectureUpdated =
      title !== existingLecture.title ||
      date !== existingLecture.date ||
      startTime !== existingLecture.startTime ||
      duration !== existingLecture.duration ||
      description !== existingLecture.description;

    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      {
        title,
        date,
        startTime,
        duration,
        description,
        course,
        instructorId,
        ...(status && { status }),
        ...(roomToken && { roomToken }),
      },
      { new: true, runValidators: true }
    );

    // Send notification only if significant details have changed
    if (isLectureUpdated) {
      await notificationManager.createNotificationsForCourse(course, {
        type: "lecture_updated",
        lecture: updatedLecture._id,
        title: `Lecture Updated: ${updatedLecture.title}`,
        message: `The lecture "${updatedLecture.title}" has been updated to ${new Date(startTime).toLocaleString()}`,
        isTimeSensitive: false,
      });
    }

    res.status(200).json(updatedLecture);
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
    const id  = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Instructor ID" });
    }

    const lectures = await Lecture.find({ instructorId: id }).populate('course');
    res.status(200).json({ data: lectures });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const getStudentLecture = async (req, res) => {
  try {
    const  id  = req.user.id ; // Student ID

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
    const lectures = await Lecture.find({ course: { $in: enrolledCourses } }).populate('course');

    res.status(200).json({ data: lectures });
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

    // Send notification for lecture cancellation
    await notificationManager.createNotificationsForCourse(deletedLecture.course, {
      type: "lecture_canceled",
      lecture: deletedLecture._id,
      title: `Lecture Canceled: ${deletedLecture.title}`,
      message: `The lecture "${deletedLecture.title}" scheduled for ${new Date(deletedLecture.startTime).toLocaleString()} has been canceled.`,
      isTimeSensitive: true,
    });

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ✅ Start Lecture (Generates room token)

export const startLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    // Fetch the lecture
    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    if (lecture.status === "completed") {
      return res.status(400).json({ message: "Lecture is already complated"});
    }
    // If lecture is already ongoing, return the existing token
    if (lecture.status === "ongoing") {
      return res.status(200).json({ message: "Lecture is already ongoing", roomToken: lecture.roomToken });
    }

    // Generate a unique JWT-based room token
    const roomToken = jwt.sign(
      { lectureId: id },
      SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Update lecture status and token
    lecture.status = "ongoing";
    lecture.roomToken = roomToken;
    await lecture.save();

    // Send notification to users
    await notificationManager.createNotificationsForCourse(lecture.course, {
      type: "lecture_started",
      lecture: lecture._id,
      title: `Lecture Started: ${lecture.title}`,
      message: `The lecture "${lecture.title}" has started. Join now!`,
      isTimeSensitive: true,
    });

    res.status(200).json({ message: "Lecture started", roomToken });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// ✅ Student Joins Lecture (Fetches room token)
export const joinLecture = async (req, res) => {
  try {
    const {id}  = req.params;
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

export const endLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Lecture ID" });
    }

    // Fetch the lecture
    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // If lecture is not ongoing, return an appropriate message
    if (lecture.status !== "ongoing") {
      return res.status(400).json({ message: "Lecture is not ongoing" });
    }

    // Update lecture status to completed
    lecture.status = "completed";
    lecture.roomToken = null; // Clear the token as the lecture is completed
    await lecture.save();

    // Send notification to users
    await notificationManager.createNotificationsForCourse(lecture.course, {
      type: "lecture_completed",
      lecture: lecture._id,
      title: `Lecture Completed: ${lecture.title}`,
      message: `The lecture "${lecture.title}" has been completed.`,
      isTimeSensitive: false,
    });

    res.status(200).json({ message: "Lecture marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

