import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home.page.jsx';
import Layout from './components/General/Layout.jsx'
import CoursePreviewPage from './pages/CoursePreview.page.jsx';
import CourseForm from './forms/fullcourseform.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/courses" exact element={<Layout><HomePage /></Layout>} />
    <Route path="/courses/:id" element={<Layout><CoursePreviewPage /></Layout>} />
    <Route path="/form" element={<Layout><CourseForm /></Layout>} />
  </Routes>
);
export default AppRoutes;
