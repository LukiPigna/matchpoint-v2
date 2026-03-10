import { http } from '../http.ts';
import type { ApiResponse, AuthResponse, User } from '../../types.ts';
import type { RegisterData } from '../../contexts/AuthContext.tsx';

export const authApi = {
  register: (data: RegisterData) =>
    http.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    http.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    http.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  logout: () =>
    http.post<ApiResponse<null>>('/auth/logout'),

  me: () =>
    http.get<ApiResponse<User>>('/auth/me'),
};
