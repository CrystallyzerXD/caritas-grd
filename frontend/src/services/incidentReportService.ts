import api from './api';
import type { IncidentReport, IncidentReportFormData, ApiResponse } from '../types';

export const incidentReportService = {
  getByIncident: (incidentId: number) =>
    api.get<ApiResponse<IncidentReport[]>>(`/api/incidents/${incidentId}/reports`).then(r => r.data.data),

  getById: (incidentId: number, reportId: number) =>
    api.get<ApiResponse<IncidentReport>>(`/api/incidents/${incidentId}/reports/${reportId}`).then(r => r.data.data),

  create: (incidentId: number, data: IncidentReportFormData) =>
    api.post<ApiResponse<IncidentReport>>(`/api/incidents/${incidentId}/reports`, data).then(r => r.data.data),

  delete: (incidentId: number, reportId: number) =>
    api.delete(`/api/incidents/${incidentId}/reports/${reportId}`),
};
