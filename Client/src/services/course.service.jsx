import db from "@/apis/database";

export const getCourse = async (courseId, token) => {
  console.log("i am running in client");
  try {
    const response = await db.get(`/courses/${courseId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Course fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return {
      success: false,
      message: "Failed to fetch course. Please try again later.",
      data: null,
    };
  }
};

export const getAllCourse = async (token) => {
  try {
    const response = await db.get(`/courses`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Courses fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      message: "Failed to fetch courses. Please try again later.",
      data: [],
    };
  }
};

export const getInstructorCourse = async (instructorId, token,params={}) => {
  try {
    const response = await db.get(`/courses/users/${instructorId}`, {
      headers: { authorization: `Bearer ${token}` },
      params
    });
    return {
      success: true,
      message:
        response.data.message || "Instructor courses fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return {
      success: false,
      message: "Failed to fetch instructor courses. Please try again later.",
      data: null,
    };
  }
};

export const getStudentEnrolledCourses = async (userId, token) => {
  try {
    const response = await db.get(`/courses/enrolled/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Enrolled courses fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return {
      success: false,
      message: "Failed to fetch enrolled courses. Please try again later.",
      data: null,
    };
  }
};

export const updateCourse = async (id, course, token) => {
  try {
    const response = await db.put(`/courses/${id}`, course, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Course updated successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      success: false,
      message: "Failed to update course. Please try again later.",
      data: null,
    };
  }
};

export const getCourseById = async (courseId, token) => {
  try {
    const response = await db.get(`/courses/${courseId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Lecture fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching lecture:", error);
    return {
      success: false,
      message: "Failed to fetch lecture. Please try again later.",
      data: null,
    };
  }
};

export const updateCourseStatus = async (courseId, status, token) => {
  try {
    const response = await db.put(
      `/courses/${courseId}/status`,
      { isActive: status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      success: true,
      message: response.data.message || "Course status updated successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error updating course status:", error);
    return {
      success: false,
      message: "Failed to update course status. Please try again later.",
      data: null,
    };
  }
};
