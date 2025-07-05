import db from "@/apis/database";

export const createReview = async (reviewData, authToken) => {
	try {
		const response = await db.post(
			`/reviews`,
			{ review: reviewData },
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			}
		);
		return response.data.data;
	} catch (error) {
		console.error("Failed to create review:", error);
		throw error;
	}
};

export const getLatestReviews = async()=>{
	try {
    const response = await db.get(`/reviews/latest`);

    return {
		success: true,
		message: response.data.message || "review fetched successfully",
		data: response.data.data,
	  };  
	} catch (error) {
    console.error("Failed to fetch latest reviews:", error);
    return {
		success: false,
		message: response.data.message || "review fetched successfully",
		data: [],
	  };  
	  }
}