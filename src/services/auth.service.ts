import { getRequest } from '@/utils/axiosRequest';

export function validateToken() {
  return getRequest<{ valid: boolean }>('/auth/validate');
}
