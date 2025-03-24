import db from "@/apis/database"
export const fetchNotifications = async (token) => {
    try {
        const response = await db.get(`/notifications`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return {
            success: true,
            message: response.data.message || "Notifications fetched successfully",
            data: response.data.data
        }
    } catch (e) {
        console.error("Error fetching notifications", e)
        return {
            success: false,
            message: "An error occurred while fetching notifications",
            data: []
        }
    }
}
export const readNotification = async(id,token) =>{
    try {
        const response = await db.put(`/notifications/${id}/read`, {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return {
            success: true,
            message: response.data.message || "Notification marked as read successfully",
            data: response.data.data
        }
    } catch (e) {
        console.error("Error marking notification as read", e)
        return {
            success: false,
            message: "An error occurred while marking notification as read",
            data: null
        }
    }
}

export const readAllNotifications = async(token)=>{
    try {
        const response = await db.put(`/notifications/read-all`, {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return {
            success: true,
            message: response.data.message || "All notifications marked as read successfully",
            data: response.data.data
        }
    } catch (e) {
        console.error("Error marking all notifications as read", e)
        return {
            success: false,
            message: "An error occurred while marking all notifications as read",
            data: null
        }
    }
}

