import { Routes, Route } from 'react-router-dom';
import LectureRoom from './components/lectureRoom';
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LectureRoom/>}/>
  </Routes>
);

export default AppRoutes;
