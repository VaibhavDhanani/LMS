import db from "@/apis/database";

export const getUser = async (userId, authToken) => {
  const response = await db.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log("service", response.data);
  return response.data.data;
};

export const updateUser = async (user, authToken) => {
  if (!user._id) {
    console.log(user);
    console.error("User ID is missing");
    return;
  }
  const response = await db.put(`/users/${user._id}`, user, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data.data;
};

export const updateUserPassword = async (user, {currentPassword,newPassword,confirmPassword},authToken) => {
  if (!user._id) {
    console.log(user);
    // console.error("User ID is missing");
    return {
      success: false,
      message: "User Id missing",
      data: null,
    };
  }

  try {
    const response = await db.put(`/users/password/${user._id}`, {currentPassword,newPassword,confirmPassword}, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.message,
    };
  } catch (error) {
    return {
        success: false,
        message: error,
        data: null,
      };
  }
};
