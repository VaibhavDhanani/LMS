import CourseDraft from "../models/courseDraft.js"; // Adjust the path to your model
import Course from "../models/course.js";
import User from "../models/user.js";
// Create a new course draft
export const createCourseDraft = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      details,
      learnPoints,
      technologies,
      prerequisites,
      requirements,
      thumbnail,
      promotionalVideo,
      curriculum,
      targetStudents,
      topics,
      pricing,
      isActive
    } = req.body;

    const newCourseDraft = new CourseDraft({
      title,
      subtitle,
      description,
      instructor:req.user.id,
      details,
      learnPoints,
      technologies,
      prerequisites,
      requirements,
      thumbnail,
      promotionalVideo,
      curriculum,
      targetStudents,
      topics,
      pricing,
      isActive,
    });

    await newCourseDraft.save();
    res.status(201).json({ message: "Course draft created successfully", data: newCourseDraft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating course draft", error });
  }
};


// Get all course drafts
export const getAllCourseDrafts = async (req, res) => {
  try {
    const courseDrafts = await CourseDraft.find().populate("instructor", "username email"); // Populate instructor details if needed
    res.status(200).json({data: courseDrafts});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching course drafts", error });
  }
};

export const getUserCourseDrafts = async (req, res) => {
  const  instructor  = req.user.id;
  try {
      const drafts = await CourseDraft.find({ instructor }).populate("instructor", "username email");
      res.status(200).json({data: drafts});
  } catch (error) {
      res.status(500).json({ error: 'Unable to fetch drafts for user' });
  }
};

// Get a single course draft by ID
export const getCourseDraftById = async (req, res) => {
  try {
    const courseDraft = await CourseDraft.findById(req.params.id)
        .populate("instructor", "name email profilePicture biography");

    if (!courseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }
    // console.log(courseDraft);
    res.status(200).json({message: "success",data: courseDraft});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching course draft", error });
  }
};

// Update a course draft by ID
export const updateCourseDraft = async (req, res) => {
  try {

    const updatedCourseDraft = await CourseDraft.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }

    res.status(200).json({ 
      message: "Course draft updated successfully", 
      data: updatedCourseDraft
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating course draft", error });
  }
};

// Delete a course draft by ID
export const deleteCourseDraft = async (req, res) => {
  try {
    const deletedCourseDraft = await CourseDraft.findByIdAndDelete(req.params.id);

    if (!deletedCourseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }

    res.status(200).json({ message: "Course draft deleted successfully", data: deletedCourseDraft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting course draft", error });
  }
};

export const publishCourseDraft = async (req, res) => {
  try {
    const { id } = req.params; // Draft ID
    const draft = await CourseDraft.findById(id);

    if (!draft) {
      return res.status(404).json({ message: "Draft not found." });
    }

    // Define required fields to check
    const requiredFields = [
      'title',
      'subtitle',
      'description',
      'instructor',
      'details',
      'pricing',
      'curriculum',
      'thumbnail',
      'promotionalVideo'
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => !draft[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields in the draft: ${missingFields.join(', ')}`,
      });
    }

    // Prepare course data
    const courseData = {
      title: draft.title,
      subtitle: draft.subtitle,
      description: draft.description,
      instructor: draft.instructor,
      details: draft.details,
      learnPoints: draft.learnPoints || [],
      technologies: draft.technologies || [],
      prerequisites: draft.prerequisites || [],
      requirements: draft.requirements || [],
      thumbnail: draft.thumbnail || "",
      promotionalVideo: draft.promotionalVideo || "",
      curriculum: draft.curriculum || [],
      targetStudents: draft.targetStudents || [],
      topics: draft.topics || [],
      pricing: draft.pricing || {},
      enrolledStudents: [],
      rating: 0,
      reviews: []
    };

    // Save new course
    const newCourse = new Course(courseData);
    await newCourse.save();

    // Update instructor's createdCourses
    await User.findByIdAndUpdate(
      draft.instructor,
      { $push: { createdCourses: newCourse._id } },
      { new: true }
    );

    // Delete the draft
    await CourseDraft.findByIdAndDelete(id);

    res.status(201).json({
      message: "Course published successfully.",
      data: newCourse,
    });

  } catch (error) {
    console.error("Error publishing draft:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

