import db from "@/apis/database";

export const createDraft = async (draft, token) => {
  try {
    const response = await db.post('/drafts', draft, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Draft created successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error creating draft:", error);
    return {
      success: false,
      message: "Failed to create draft. Please try again later.",
      data: null,
    };
  }
};

export const getDrafts = async ( token) => {
  try {
    const response = await db.get(`/drafts/users`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Drafts fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return {
      success: false,
      message: "Failed to fetch drafts. Please try again later.",
      data: [],
    };
  }
};

export const getDraftById = async (id, token) => {
  try {
    const response = await db.get(`/drafts/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Draft fetched successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching draft:", error);
    return {
      success: false,
      message: "Failed to fetch draft. Please try again later.",
      data: null,
    };
  }
};

export const updateDraft = async (id, draft, token) => {
  try {
    const response = await db.put(`/drafts/${id}`, draft, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Draft updated successfully",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error updating draft:", error);
    return {
      success: false,
      message: "Failed to update draft. Please try again later.",
      data: null,
    };
  }
};

export const publishDraft = async (id, draft, token) => {
  try {
    const response = await db.post(`/publishdrafts/${id}`, draft, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.error) {
      console.error("Error while publishing draft:", response);
      throw new Error(response.error);
    }
    return {
      success: true,
      message: response.data.message || "Draft published successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error publishing draft:", error);
    return {
      success: false,
      message: error.response.data.message||"Failed to publish draft. Please try again later.",
      data: null,
    };
  }
};

export const deleteDraft = async (id, token) => {
  try {
    const response = await db.delete(`/drafts/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return {
      success: true,
      message: response.data.message || "Draft deleted successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting draft:", error);
    return {
      success: false,
      message: "Failed to delete draft. Please try again later.",
      data: null,
    };
  }
};
