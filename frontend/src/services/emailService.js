import api from "./api";
export const generateEmail = async (payload) =>{
    const {data} = await api.post(`/cover-letters`, payload);
    return data.data;
}
export const getAllEmails = async ()=>{
    const {data} = await api.get("/cover-letters/");
    return data.data;
}

export const getEmailById = async (id)=>{
    const {data} = await api.get(`/cover-letters/${id}`);
    return data.data;
}

export const deleteEmail = async (id)=>{
    const {data} = await api.delete(`/cover-letters/${id}`);
    return data.data;
}

export const updateEmail = async (id, payload)=>{
    const {data} = await api.put(`/cover-letters/${id}`, payload);
    return data.data;
}
