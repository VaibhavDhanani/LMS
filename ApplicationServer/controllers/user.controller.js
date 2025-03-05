import User from "../models/user.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const {name,email,password} = req.body;
    const isInstructor = req.body.role == "instructor"
    const userData= {name,email,password,isInstructor,isVerified: false}
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
    res.status(200).json({message:"User Found",data:user});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    // console.log("Received ID:", req.params.id);
    // console.log("Received Body:", req.body);
    if (!req.params.id) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    // console.log("Updated User:", user);
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
export const validateUser = async (req,res) => {
  try {
    const users = await User.find();
    const {email,password} = req.body;
    const user = users.filter((u)=> u.email===email && u.password===password);
    if(user){
      res.status(200).json({
        data: user,
        message: "User authenticated successfully"
      })
    }
  } catch (error) {
    res.status(400).json({
      data: null,
      message: error.message
    })
  }
}
