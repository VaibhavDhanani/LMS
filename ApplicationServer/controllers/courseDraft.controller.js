import CourseDraft from "../models/courseDraft.js"; // Adjust the path to your model
import Course from "../models/course.js";
// Create a new course draft
export const createCourseDraft = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      instructor,
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
      instructor,
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
    res.status(201).json({ message: "Course draft created successfully", newCourseDraft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating course draft", error });
  }
};

// Get all course drafts
export const getAllCourseDrafts = async (req, res) => {
  try {
    const courseDrafts = await CourseDraft.find().populate("instructor", "username email"); // Populate instructor details if needed
    res.status(200).json(courseDrafts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching course drafts", error });
  }
};

// Get a single course draft by ID
export const getCourseDraftById = async (req, res) => {
  try {
    const courseDraft = await CourseDraft.findById(req.params.id).populate("instructor", "username email");

    if (!courseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }

    res.status(200).json(courseDraft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching course draft", error });
  }
};

// Update a course draft by ID
export const updateCourseDraft = async (req, res) => {
  try {
    // Add the current timestamp to the update object
    const updateData = { ...req.body, lastUpdated: new Date() };

    const updatedCourseDraft = await CourseDraft.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCourseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }

    res.status(200).json({ 
      message: "Course draft updated successfully", 
      updatedCourseDraft 
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

    res.status(200).json({ message: "Course draft deleted successfully", deletedCourseDraft });
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

    // Validate required fields for course creation
    if (!draft.title || !draft.subtitle || !draft.description 
      //|| !draft.instructor
      ) {
      return res.status(400).json({ message: "Missing required fields in the draft." });
    }

    // Create the new course using the draft data
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
      lectures: draft.lectures || [],
      targetStudents: draft.targetStudents || [],
      topics: draft.topics || [],
      pricing: draft.pricing || {},
      createdAt: new Date(),
      lastUpdated: new Date(),
      enrolledStudents: [],
      rating: 0,
      reviews: []
    };

    const newCourse = new Course(courseData);
    await newCourse.save();

    // Optional: Delete the draft after publishing
    await CourseDraft.findByIdAndDelete(id);

    res.status(201).json({
      message: "Course published successfully.",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error publishing draft:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};