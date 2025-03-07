import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  validateUser,
  getUserInfo,
  updateWishlist
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/users", createUser);
router.put("/users/wishlists/:courseId", updateWishlist );
router.post("/users/validate",validateUser);
router.get("/users/info", getUserInfo);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
