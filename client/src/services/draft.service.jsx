import db from '../apis/database.js'

export const createDraft = async (draft)=>{
    const response = await db.post('/drafts',draft);
    return response.data;
}

export const getDrafts = async ()=>{
    const response = await db.get('/drafts');
    return response.data;
}

export const getDraftById = async (id)=>{
    const response = await db.get(`/drafts/${id}`);
    console.log(response.data);
    return response.data;
}

export const updateDraft = async (id,draft)=>{
    const response = await db.put(`/drafts/${id}`,draft);
    return response.data;
}

export const deleteDraft = async (id)=>{
    const response = await db.delete(`/drafts/${id}`);
    return response.data;
}



