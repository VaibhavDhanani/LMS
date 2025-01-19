import db from '@/apis/database';

export const getUser = async (userId,authToken) => {
    const response = await db.get(`/users/${userId}`,{
        headers: { Authorization: `Bearer ${authToken}` }
    })
    return response.data.data
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
