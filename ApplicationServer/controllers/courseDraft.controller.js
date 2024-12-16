import CourseDraft from "../models/courseDraft.js"; // Adjust the path to your model

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
    const updatedCourseDraft = await CourseDraft.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourseDraft) {
      return res.status(404).json({ message: "Course draft not found" });
    }

    res.status(200).json({ message: "Course draft updated successfully", updatedCourseDraft });
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
