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
		alert(`Failed to create review: ${error.response.data.message}`);
		throw error;
	}
};
