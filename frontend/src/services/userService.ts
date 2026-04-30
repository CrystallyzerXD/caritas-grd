import api from './api';
import type { ApiResponse, PageResponse, User, UserFormData } from '../types';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<PageResponse<User>>>('/api/users', {
      params: { size: 100 },
    });
    return response.data.data.content;
  },

  async getById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data.data;
  },

  async create(data: UserFormData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/api/users', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, data);
    return response.data.data;
  },

  async toggleActive(id: number, active: boolean): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/api/users/${id}/active`, { active });
    return response.data.data;
  },
};
