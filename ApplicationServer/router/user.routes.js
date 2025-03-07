import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  validateUser,
  updateUserPassword
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/users", createUser);
router.post("/users/validate",validateUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.put("/users/password/:id", updateUserPassword);
router.delete("/users/:id", deleteUser);

export default router;
