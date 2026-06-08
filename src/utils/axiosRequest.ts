import getAxios from '@/configAxios';
import axios, { AxiosError } from 'axios';
import type { TypeOptions } from 'react-toastify';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  type?: TypeOptions | 'loading' | 'dismiss';
  error?: unknown;
};

function handleError(err: unknown): ApiResponse<never> {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<{ message?: string; error?: unknown; }>;
    return {
      success: false,
      message: axiosError.response?.data?.message ?? 'Erro na requisição',
      error: axiosError.response?.data?.error ?? err,
      type: 'error',
    };
  }

  return {
    success: false,
    message: 'Erro inesperado',
    error: err,
    type: 'error',
  };
}

export async function postRequest<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const axios = getAxios();
  try {
    const { data } = await axios.post<ApiResponse<T>>(url, body);
    return { ...data, success: true, message: data.message, type: 'success' };
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function getRequest<T>(url: string): Promise<ApiResponse<T>> {
  const axios = getAxios();
  try {
    const { data } = await axios.get<ApiResponse<T>>(url);
    return { ...data, success: true, message: data.message, type: 'success' };
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function deleteRequest<T>( url: string, body?: unknown): Promise<ApiResponse<T>> {
  const axios = getAxios();
  try {
    const { data } = await axios.delete<ApiResponse<T>>(url, { data: body });
    return { ...data, success: true, message: data.message, type: 'success' };
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function putRequest<T>( url: string, body: unknown ): Promise<ApiResponse<T>> {
  const axios = getAxios();
  try {
    const { data } = await axios.put<ApiResponse<T>>(url, body);
    return { ...data, success: true, message: data.message, type: 'success' };
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function patchRequest<T = unknown>( url: string, body?: unknown ): Promise<ApiResponse<T>> {
  const axios = getAxios();
  try {
    const { data } = await axios.patch<ApiResponse<T>>(url, body);
    return { ...data, success: true, message: data.message, type: 'success' };
  } catch (err: unknown) {
    return handleError(err);
  }
}
