import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost/pos-system/backend',
  withCredentials: true
});

export default axiosClient;
