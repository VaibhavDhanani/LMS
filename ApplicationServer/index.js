import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import Stripe from "stripe";
import authRoutes from "./router/auth.routes.js";
import courseRoutes from "./router/course.routes.js";
import enrollmentRoutes from "./router/enrollment.routes.js";
import reviewRoutes from "./router/reviews.routes.js";
import userRoutes from "./router/user.routes.js";
import connectDB from "./utills/dbConnection.js";
import authenticateToken from "./middlewares/auth.middleware.js";
import courseDraft from "./router/courseDraft.routes.js";
import webhookRoutes from "./router/webhook.routes.js";
import transactionRoutes from "./router/transaction.routes.js";
import paymentRoutes from "./router/payment.routes.js";
import lectureRoutes from "./router/lecture.routes.js";
import ChatRoutes from "./router/chat.routes.js";
import notificationRoutes from "./router/notification.routes.js";
configDotenv();
const app = express();
connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: allowedOrigins, // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods,
    credentials: true,
  })
);


app.use("/api/stripe", webhookRoutes);
app.use(express.json());
app.use("/api/payment", authenticateToken, paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", courseRoutes,reviewRoutes,ChatRoutes);
app.use(
  "/api",
  authenticateToken,
  userRoutes,
  courseDraft,
  enrollmentRoutes,
  transactionRoutes,
  lectureRoutes,
  notificationRoutes
);
app.use(
  "/api1",
  userRoutes,
  courseDraft,
  courseRoutes,
  enrollmentRoutes,
  reviewRoutes,
  transactionRoutes
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
