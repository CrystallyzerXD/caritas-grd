import api from './api';
import type { Brigadista, BrigadistaFormData, ApiResponse, PageResponse } from '../types';

export const brigadistaService = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Brigadista>> => {
    const res = await api.get<ApiResponse<PageResponse<Brigadista>>>(
      `/api/brigadistas?page=${page}&size=${size}`
    );
    return res.data.data;
  },

  getAvailable: async (): Promise<Brigadista[]> => {
    const res = await api.get<ApiResponse<Brigadista[]>>('/api/brigadistas/disponibles');
    return res.data.data;
  },

  getById: async (id: number): Promise<Brigadista> => {
    const res = await api.get<ApiResponse<Brigadista>>(`/api/brigadistas/${id}`);
    return res.data.data;
  },

  create: async (data: BrigadistaFormData): Promise<Brigadista> => {
    const res = await api.post<ApiResponse<Brigadista>>('/api/brigadistas', data);
    return res.data.data;
  },

  update: async (id: number, data: BrigadistaFormData): Promise<Brigadista> => {
    const res = await api.put<ApiResponse<Brigadista>>(`/api/brigadistas/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/brigadistas/${id}`);
  },
};
