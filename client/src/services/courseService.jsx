import db from '@/apis/database';
const authToken = localStorage.getItem('authToken');

export const fetchAllCourses = async () => {
  const response = await db.get('/courses', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = response.data.data;
  console.log(data);
  return data;
};

export const fetchCourseById = async (id) => {
  const response = await db.get(`/courses/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = response.data;
  console.log(data)
  return data;
};
