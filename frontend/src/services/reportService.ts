import api from './api';
import type { ApiResponse, DashboardStats } from '../types';

export const reportService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/api/reports/dashboard');
    return response.data.data;
  },

  async downloadIncidentsExcel(params?: Record<string, string>): Promise<Blob> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/api/reports/incidents/excel${query}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadAffectedPersonsExcel(params?: Record<string, string>): Promise<Blob> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/api/reports/affected-persons/excel${query}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadEnvironmentalExcel(params?: Record<string, string>): Promise<Blob> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/api/reports/environmental/excel${query}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
