import { Route, Routes } from 'react-router-dom';
import Layout from './components/General/Layout.jsx';
import ProtectedRoute from './context/protectedRoute.jsx';
import { AuthForm } from './forms/Authentication/AuthForm.jsx';
import CourseForm from './forms/Course/fullcourseform.jsx';
import CoursePreviewPage from './pages/CoursePreview.page.jsx';
import HomePage from './pages/Home.page.jsx';
import MyCourses from './pages/MyCourses.jsx';
import UserProfilePage from './pages/UserProfile.page.jsx';

const AppRoutes = () => (
  <Routes>
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

    <Route element={<ProtectedRoute />}>
      <Route path="/courses/:id" element={<CoursePreviewPage />} />
      <Route path="/success" element={<h1>Success</h1>} />
      <Route path="/cancel" element={<h1>Cancel</h1>} />
      <Route path="/courses" element={<HomePage />} />
      <Route path="/form" element={<CourseForm />} />
      <Route path="/user/profile" element={<UserProfilePage />} />
      <Route path="/mycourses" element={<MyCourses />} />
    <Route path="/courseform/:id" element={<Layout><CourseForm /></Layout>} />
    </Route>

    {/* Placeholder for future chat feature */}
    {/* <Route path="/chat" element={<Layout><VideoChat /></Layout>} /> */}
  </Routes>
);

export default AppRoutes;
