import { Route, Routes, Outlet } from "react-router-dom";
import Layout from "./components/General/Layout.jsx";
import ProtectedRoute from "./context/protectedRoute.jsx";
import { AuthForm } from "./forms/Authentication/AuthForm.jsx";
import CourseForm from "./forms/Course/courseForm.jsx";
import DraftForm from "./forms/Course/DraftForm.jsx";
import CoursePreviewPage from "./pages/Course/CoursePreview.page.jsx";
import MyCourses from "./pages/MyCourses.page.jsx";
import LectureRoom from "./components/Extra/lectureRoom.jsx";
import LectureRoom1 from "./components/Extra/demo.jsx";
import ViewLecturePage from "./pages/Course/ViewLecture.page.jsx";
import MyLearningPage from "@/pages/MyLearnings.page.jsx";
import ManageLiveLectures from "./pages/LiveLecture/liveLectureSection.jsx";
import LectureStreaming from "./pages/LiveLecture/lectureStreaming.page.jsx";
import LiveLecture from "./pages/LiveLecture/livelecture.jsx";
import CourseAnalyticsPage from "./pages/Course/Course.page.jsx";
import SalesAnalyticsPage from "./pages/SalesAnalytics.page.jsx";
import TransactionHistory from "./pages/Transaction.page.jsx";
import HomePage from "./pages/Home.page.jsx";
import CoursePage from "./pages/Course.page.jsx";
import NotificationsPage from "./pages/Notifications.page.jsx";
import ProfilePage from "./pages/Profile/Profile.page.jsx";
import SecuritySettings from "./pages/Profile/SecuritySettings.jsx";
import Wishlist from "./pages/Profile/Wishlist.jsx";
import { NotFound } from "./components/General/NotFound.jsx";
const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <Layout>
          {" "}
          <HomePage />{" "}
        </Layout>
      }
    />
    <Route
      path="/courses/:id"
      element={
        <Layout>
          <CoursePreviewPage />
        </Layout>
      }
    />
    <Route
      path="/auth"
      element={
        <Layout>
          {" "}
          <AuthForm />{" "}
        </Layout>
      }
    />
    <Route
      path="/courses"
      element={
        <Layout>
          <CoursePage />
        </Layout>
      }
    />
    {/* Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        <Route path="/mylearnings/:id" element={<ViewLecturePage />} />
        <Route
          path="/courses-analytics/:id"
          element={<CourseAnalyticsPage />}
        />
        <Route path="/success" element={<h1>Success</h1>} />
        <Route path="/cancel" element={<h1>Cancel</h1>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<SecuritySettings />} />
        <Route path="/profile/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mylearnings" element={<MyLearningPage />} />
        <Route path="/mycourses" element={<MyCourses />} />
        <Route path="/draft/:id" element={<DraftForm />} />
        <Route path="/courseform/:id" element={<CourseForm />} />
        <Route path="/livelecture/section" element={<ManageLiveLectures />} />
        <Route path="/livelecture/:id" element={<LectureStreaming />} />
        <Route path="/livelecture/view/:id" element={<LiveLecture />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/sales" element={<SalesAnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />;
  </Routes>
);

export default AppRoutes;
