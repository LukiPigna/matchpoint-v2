import { http } from '../http.ts';
import type { ApiResponse, PaginatedResponse, Venue, Court } from '../../types.ts';

export const venuesApi = {
  list: (params?: { zone?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<PaginatedResponse<Venue>>(`/venues${qs ? `?${qs}` : ''}`);
  },

  getOne: (id: string) =>
    http.get<ApiResponse<Venue>>(`/venues/${id}`),

  getAvailability: (id: string, date: string) =>
    http.get<ApiResponse<{ courtId: string; availableSlots: string[] }[]>>(
      `/venues/${id}/availability?date=${date}`
    ),

  getCourts: (venueId: string) =>
    http.get<ApiResponse<Court[]>>(`/venues/${venueId}/courts`),
};
