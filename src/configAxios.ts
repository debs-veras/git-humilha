import axios, { type AxiosInstance } from 'axios';
import useUserStore from './store/useUserStore';

const URL_API = import.meta.env.VITE_URL_API;

const getAxios = (timeout: number = 600000) => {
  const token = useUserStore.getState().token;
  const instance: AxiosInstance = axios.create({
    baseURL: URL_API,
    timeout: timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return instance;
};

export default getAxios;
