import { Route, Routes,Outlet  } from 'react-router-dom';
import Layout from './components/General/Layout.jsx';
import ProtectedRoute from './context/protectedRoute.jsx';
import { AuthForm } from './forms/Authentication/AuthForm.jsx';
import CourseForm from './forms/Course/CourseForm.jsx';
import DraftForm from './forms/Course/DraftForm.jsx';
import CoursePreviewPage from './pages/CoursePreview.page.jsx';
import HomePage from './pages/Home.page.jsx';
import MyCourses from './pages/MyCourses.jsx';
import UserProfilePage from './pages/UserProfile.page.jsx';
import LectureRoom from './components/lectureRoom.jsx';
import LectureRoom1 from './components/demo.jsx';
import ChatbotInterface from "@/components/chatbot.jsx";
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/"
      element={
        <Layout>
          <HomePage />
        </Layout>
      }
    />
    <Route
      path="/auth"
      element={
        <Layout>
          <AuthForm />
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
        <Route path="/courses/:id" element={<CoursePreviewPage />} />
        <Route path="/success" element={<h1>Success</h1>} />
        <Route path="/cancel" element={<h1>Cancel</h1>} />
        <Route path="/courses" element={<HomePage />} />
        <Route path="/form" element={<CourseForm />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/mycourses" element={<MyCourses />} />
        <Route path="/draft/:id" element={<DraftForm />} />
        <Route path="/courseform/:id" element={<CourseForm />} />
          <Route path="/aihelp" element={<ChatbotInterface />}/>
      </Route>
    </Route>
        <Route path="/lectureroom" element={<LectureRoom />} />
        <Route path="/lectureroom1" element={<LectureRoom1 />} />

    {/* Future Feature Placeholder */}
    {/* <Route path="/chat" element={<Layout><VideoChat /></Layout>} /> */}
  </Routes>
);

export default AppRoutes;
