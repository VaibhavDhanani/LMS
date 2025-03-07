import express from "express";
import {
    createCourseDraft,
    getAllCourseDrafts,
    getCourseDraftById,
    updateCourseDraft,
  deleteCourseDraft,
  publishCourseDraft,
  getUserCourseDrafts
} from "../controllers/courseDraft.controller.js";

const router = express.Router();

router.post("/drafts", createCourseDraft);
router.get("/drafts/users", getUserCourseDrafts);
router.get("/drafts/:id", getCourseDraftById);
router.get("/drafts",getAllCourseDrafts);
router.put("/drafts/:id", updateCourseDraft);
router.delete("/drafts/:id", deleteCourseDraft);
router.post("/publishdrafts/:id", publishCourseDraft);
export default router;
