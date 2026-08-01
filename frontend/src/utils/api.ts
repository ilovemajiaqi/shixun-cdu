import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api', // Nginx will proxy this to backend
  timeout: 5000
})

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
      // We handle specific errors in the component, but can add global handlers here
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      ElMessage.error({ message: '网络连接失败，请检查您的网络设置', duration: 1500 });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api
