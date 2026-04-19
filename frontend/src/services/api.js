import axios from 'axios';

const api = axios.create({
  // In production this would be relative or via env var
  baseURL: 'http://localhost:8000',
});

export const processImageAPI = async (file, operations, signal) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('operations', JSON.stringify(operations));

  const response = await api.post('/process-image', formData, {
    responseType: 'blob',
    signal: signal // for aborting requests if user keeps sliding
  });

  return URL.createObjectURL(response.data);
};
