import api from './api';
import type { ApiResponse, EventType, District, Parish } from '../types';

export const catalogService = {
  async getEventTypes(): Promise<EventType[]> {
    const response = await api.get<ApiResponse<EventType[]>>('/api/catalogs/event-types');
    return response.data.data;
  },

  async createEventType(data: Partial<EventType>): Promise<EventType> {
    const response = await api.post<ApiResponse<EventType>>('/api/catalogs/event-types', data);
    return response.data.data;
  },

  async updateEventType(id: number, data: Partial<EventType>): Promise<EventType> {
    const response = await api.put<ApiResponse<EventType>>(`/api/catalogs/event-types/${id}`, data);
    return response.data.data;
  },

  async getDistricts(): Promise<District[]> {
    const response = await api.get<ApiResponse<District[]>>('/api/catalogs/districts');
    return response.data.data;
  },

  async createDistrict(data: Partial<District>): Promise<District> {
    const response = await api.post<ApiResponse<District>>('/api/catalogs/districts', data);
    return response.data.data;
  },

  async updateDistrict(id: number, data: Partial<District>): Promise<District> {
    const response = await api.put<ApiResponse<District>>(`/api/catalogs/districts/${id}`, data);
    return response.data.data;
  },

  async getParishes(): Promise<Parish[]> {
    const response = await api.get<ApiResponse<Parish[]>>('/api/catalogs/parishes');
    return response.data.data;
  },

  async createParish(data: Partial<Parish>): Promise<Parish> {
    const response = await api.post<ApiResponse<Parish>>('/api/catalogs/parishes', data);
    return response.data.data;
  },

  async updateParish(id: number, data: Partial<Parish>): Promise<Parish> {
    const response = await api.put<ApiResponse<Parish>>(`/api/catalogs/parishes/${id}`, data);
    return response.data.data;
  },
};
