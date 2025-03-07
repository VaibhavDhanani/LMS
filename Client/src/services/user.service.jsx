import db from '@/apis/database';
export const updateWishlist =async(courseId,isAdding,token)=>{
  try{
    const response = await db.put(`/users/wishlists/${courseId}`, { isAdding }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return {
        success: true,
        message: response.data.message || "Wishlist updated successfully",
        data: response.data.data,
    };
  }catch(e){
    console.error('Error updating wishlist:', e);
    return {
        success: false,
        message: "Failed to update wishlist. Please try again later.",
        data: null,
    };
  }
};
export const getUser = async (userId,authToken) => {
    const response = await db.get(`/users/${userId}`,{
        headers: { Authorization: `Bearer ${authToken}` }
    })
    // console.log("service" ,response.data)
    return response.data.data
}
export const getUserInfo = async (token) => {
    try {
    const response = await db.get(`/users/info`,{
        headers: { authorization: `Bearer ${token}` },
        });
        return {
          success: true,
          message: response.data.message ,
          data: response.data.data,
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        return {
          success: false,
          message: "Failed to fetch user. Please try again later.",
          data: null,
        };
      }
}

export const updateUser = async (user, authToken) => {
    if (!user._id) {
        console.log(user)
        console.error("User ID is missing");
        return;
    }
    const response = await db.put(`/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.data;
};
