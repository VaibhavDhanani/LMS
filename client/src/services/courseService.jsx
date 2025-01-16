import db from '@/apis/database';
const authToken = localStorage.getItem('authToken');

export const fetchAllCourses = async () => {
  const response = await db.get('/courses', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = response.data;
  return data;
};
