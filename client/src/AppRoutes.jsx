import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home.page.jsx';
import Layout from './components/General/Layout.jsx'
import CoursePreviewPage from './pages/CoursePreview.page.jsx';
import CourseForm from './forms/Course/fullcourseform.jsx';
import { AuthForm } from './forms/Authentication/AuthForm.jsx';
import UserProfilePage from './pages/UserProfile.page.jsx';
import VideoChat from './pages/LiveLecture.page.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/courses" exact element={<Layout><HomePage /></Layout>} />
    <Route path="/courses/:id" element={<Layout><CoursePreviewPage /></Layout>} />
    <Route path="/form" element={<Layout><CourseForm /></Layout>} />
    <Route path="/auth" element={<Layout><AuthForm /></Layout>} />
    <Route path="/user/profile" element={<Layout><UserProfilePage /></Layout>} />
    <Route path="/chat" element={<Layout><VideoChat /></Layout>} />
  </Routes>
);
export default AppRoutes;
