import { http } from '../http.ts';
import type { ApiResponse, User } from '../../types.ts';

export const usersApi = {
  getProfile: (id: string) =>
    http.get<ApiResponse<User>>(`/users/${id}`),

  search: (query: string) =>
    http.get<ApiResponse<User[]>>(`/users/search?q=${encodeURIComponent(query)}`),

  updateMe: (data: Partial<Pick<User, 'name' | 'zone' | 'avatar'>>) =>
    http.patch<ApiResponse<User>>('/users/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    http.patch<ApiResponse<null>>('/users/me/password', data),

  friends: () =>
    http.get<ApiResponse<User[]>>('/users/friends'),

  sendFriendRequest: (id: string) =>
    http.post<ApiResponse<null>>(`/users/friends/${id}/request`),

  acceptFriendRequest: (id: string) =>
    http.patch<ApiResponse<null>>(`/users/friends/${id}/accept`),

  removeFriend: (id: string) =>
    http.delete<ApiResponse<null>>(`/users/friends/${id}`),
};
