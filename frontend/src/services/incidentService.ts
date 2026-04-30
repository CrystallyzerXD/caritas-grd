import api from './api';
import type {
  ApiResponse,
  PageResponse,
  Incident,
  IncidentFormData,
  IncidentFilters,
  AffectedPerson,
  AffectedPersonFormData,
  Evidence,
} from '../types';

const MIN_FILTER_YEAR = 1900;

function normalizeFilterDate(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [yearStr] = trimmed.split('-');
  const year = Number(yearStr);
  if (!Number.isFinite(year) || year < MIN_FILTER_YEAR) return null;

  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  // Ensure date is calendar-valid (e.g. rejects 2026-02-31)
  return parsed.toISOString().slice(0, 10) === trimmed ? trimmed : null;
}

export const incidentService = {
  async getAll(filters: IncidentFilters): Promise<PageResponse<Incident>> {
    const params = new URLSearchParams();
    params.append('page', String(filters.page));
    params.append('size', String(filters.size));
    if (filters.status) params.append('status', filters.status);
    if (filters.eventTypeId) params.append('eventTypeId', String(filters.eventTypeId));
    if (filters.districtId) params.append('districtId', String(filters.districtId));
    const dateFrom = normalizeFilterDate(filters.dateFrom);
    const dateTo = normalizeFilterDate(filters.dateTo);

    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await api.get<ApiResponse<PageResponse<Incident>>>(
      `/api/incidents?${params.toString()}`
    );
    return response.data.data;
  },

  async getById(id: number): Promise<Incident> {
    const response = await api.get<ApiResponse<Incident>>(`/api/incidents/${id}`);
    return response.data.data;
  },

  async create(data: IncidentFormData): Promise<Incident> {
    const response = await api.post<ApiResponse<Incident>>('/api/incidents', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<IncidentFormData>): Promise<Incident> {
    const response = await api.put<ApiResponse<Incident>>(`/api/incidents/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/incidents/${id}`);
  },

  // Affected persons
  async getAffectedPersons(incidentId: number): Promise<AffectedPerson[]> {
    const response = await api.get<ApiResponse<AffectedPerson[]>>(
      `/api/incidents/${incidentId}/affected-persons`
    );
    return response.data.data;
  },

  async addAffectedPerson(
    incidentId: number,
    data: AffectedPersonFormData
  ): Promise<AffectedPerson> {
    const response = await api.post<ApiResponse<AffectedPerson>>(
      `/api/incidents/${incidentId}/affected-persons`,
      data
    );
    return response.data.data;
  },

  // Evidence
  async getEvidences(incidentId: number): Promise<Evidence[]> {
    const response = await api.get<ApiResponse<Evidence[]>>(
      `/api/incidents/${incidentId}/evidences`
    );
    return response.data.data;
  },

  async uploadEvidence(incidentId: number, formData: FormData): Promise<Evidence> {
    const response = await api.post<ApiResponse<Evidence>>(
      `/api/incidents/${incidentId}/evidences`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },
};
