import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {
  createProject: (data) => axios.post(`${API_BASE}/projects`, data),
  
  listProjects: () => axios.get(`${API_BASE}/projects`),
  
  uploadBaseline: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/projects/${projectId}/upload-baseline`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadCurrent: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/projects/${projectId}/upload-current`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  analyzeDrift: (projectId, mode) => 
    axios.post(`${API_BASE}/projects/${projectId}/analyze`, { mode }),
  
  getAnalyses: (projectId) => 
    axios.get(`${API_BASE}/projects/${projectId}/analyses`)
};
