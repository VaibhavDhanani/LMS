import User from "../models/user.js";
import bcrypt from "bcrypt";

export const updateWishlist =async(req, res, ) => {
  try {
      const userId = req.user.id; // Assuming user ID is extracted from the authenticated request
      const { courseId } = req.params; // Get courseId from URL params
      const { isAdding } = req.body; // Get isAdding from request body
  
      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Update wishlist based on isAdding flag
      if (isAdding) {
        // Add course if not already in wishlist
        if (!user.wishlist.includes(courseId)) {
          user.wishlist.push(courseId);
        }
      } else {
        // Remove course from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== courseId);
      }
  
      // Save updated user document
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Wishlist updated successfully.",
        data: user.wishlist, // Return updated wishlist
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the wishlist.",
      });
    }
  };
  
  export const getUserInfo = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select("-password")
        .populate({
          path: "enrolledCourses",
          select: "title subtitle pricing thumbnail instructor curriculum details",
          populate: {
            path: "instructor",  // Populate the instructor field inside enrolledCourses
            select: "name"  // Only fetch the instructor's name
          }
        })
        .populate({
          path: "wishlist",
          select: "title subtitle pricing thumbnail instructor curriculum enrolledStudents details topics rating subtitle",
          populate: {
            path: "instructor",  // Populate the instructor field inside enrolledCourses
            select: "name"  // Only fetch the instructor's name
          }
        });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.status(200).json({ message: "User Found", data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isInstructor = req.body.role == "instructor";
    const userData = { name, email, password, isInstructor, isVerified: false };
    // console.log(userData)
    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User Found", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated", data: user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// validate user
export const validateUser = async (req, res) => {
  try {
    const users = await User.find();
    const { email, password } = req.body;
    const user = users.filter(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      res.status(200).json({
        data: user,
        message: "User authenticated successfully",
      });
    }
  } catch (error) {
    res.status(400).json({
      data: null,
      message: error.message,
    });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};