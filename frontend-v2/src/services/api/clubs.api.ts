import { http } from '../http.ts';
import type { ApiResponse, PaginatedResponse, Club, User } from '../../types.ts';

export const clubsApi = {
  list: (params?: { zone?: string; page?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<PaginatedResponse<Club>>(`/clubs${qs ? `?${qs}` : ''}`);
  },

  myClubs: () =>
    http.get<ApiResponse<Club[]>>('/clubs/me'),

  getOne: (id: string) =>
    http.get<ApiResponse<Club>>(`/clubs/${id}`),

  getMembers: (id: string) =>
    http.get<ApiResponse<User[]>>(`/clubs/${id}/members`),

  join: (id: string) =>
    http.post<ApiResponse<Club>>(`/clubs/${id}/join`),

  leave: (id: string) =>
    http.delete<ApiResponse<null>>(`/clubs/${id}/leave`),

  create: (data: { name: string; tag: string; description?: string; imageUrl?: string }) =>
    http.post<ApiResponse<Club>>('/clubs', data),
};
