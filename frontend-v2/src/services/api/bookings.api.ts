import { http } from '../http.ts';
import type { ApiResponse, PaginatedResponse, Booking } from '../../types.ts';

export interface CreateBookingPayload {
  courtId: string;
  venueId: string;
  date: string;
  startTime: string;
  duration: number;
  level: string;
  type?: 'CASUAL' | 'COMPETITIVE';
  visibility?: 'PUBLIC' | 'PRIVATE';
  notes?: string;
  price: number;
  maxPlayers?: number;
}

export const bookingsApi = {
  myBookings: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<PaginatedResponse<Booking>>(`/bookings/me${qs ? `?${qs}` : ''}`);
  },

  create: (data: CreateBookingPayload) =>
    http.post<ApiResponse<Booking>>('/bookings', data),

  cancel: (id: string) =>
    http.delete<ApiResponse<Booking>>(`/bookings/${id}`),

  setResult: (id: string, data: { winnerIds: string[]; score?: string }) =>
    http.patch<ApiResponse<Booking>>(`/bookings/${id}/result`, data),
};
