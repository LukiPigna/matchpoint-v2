import { http } from '../http.ts';
import type { ApiResponse, PaginatedResponse, Tournament } from '../../types.ts';

export const tournamentsApi = {
  list: (params?: { zone?: string; status?: string; page?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<PaginatedResponse<Tournament>>(`/tournaments${qs ? `?${qs}` : ''}`);
  },

  getOne: (id: string) =>
    http.get<ApiResponse<Tournament>>(`/tournaments/${id}`),

  register: (id: string) =>
    http.post<ApiResponse<Tournament>>(`/tournaments/${id}/register`),

  unregister: (id: string) =>
    http.delete<ApiResponse<null>>(`/tournaments/${id}/unregister`),
};
