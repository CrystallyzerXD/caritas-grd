import api from './api';
import type { ApiResponse, Environmental, EnvironmentalFormData, PageResponse } from '../types';

export const environmentalService = {
  async getAll(params?: Record<string, string>): Promise<PageResponse<Environmental>> {
    const searchParams = new URLSearchParams(params ?? {});
    const query = searchParams.toString();
    const response = await api.get<ApiResponse<PageResponse<Environmental>>>(`/api/environmental${query ? `?${query}` : ''}`);
    return response.data.data;
  },

  async getById(id: number): Promise<Environmental> {
    const response = await api.get<ApiResponse<Environmental>>(`/api/environmental/${id}`);
    return response.data.data;
  },

  async create(data: EnvironmentalFormData): Promise<Environmental> {
    const response = await api.post<ApiResponse<Environmental>>('/api/environmental', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<EnvironmentalFormData>): Promise<Environmental> {
    const response = await api.put<ApiResponse<Environmental>>(`/api/environmental/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/environmental/${id}`);
  },

  async getStatistics(): Promise<Record<string, number | Record<string, number>>> {
    const response = await api.get<{ data: Record<string, number | Record<string, number>> }>('/api/environmental/statistics');
    return response.data.data;
  },
};
