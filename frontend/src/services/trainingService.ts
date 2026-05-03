import api from './api';
import type { Training, TrainingFormData, TrainingParticipant, TrainingParticipantFormData, ApiResponse, PageResponse } from '../types';

export const trainingService = {
  getAll: (params: { status?: string; parishId?: number; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Training>>>('/api/trainings', { params }).then(r => r.data.data),

  getById: (id: number) =>
    api.get<ApiResponse<Training>>(`/api/trainings/${id}`).then(r => r.data.data),

  create: (data: TrainingFormData) =>
    api.post<ApiResponse<Training>>('/api/trainings', data).then(r => r.data.data),

  update: (id: number, data: Partial<TrainingFormData>) =>
    api.put<ApiResponse<Training>>(`/api/trainings/${id}`, data).then(r => r.data.data),

  delete: (id: number) =>
    api.delete(`/api/trainings/${id}`),

  getParticipants: (trainingId: number) =>
    api.get<ApiResponse<TrainingParticipant[]>>(`/api/trainings/${trainingId}/participants`).then(r => r.data.data),

  addParticipant: (trainingId: number, data: TrainingParticipantFormData) =>
    api.post<ApiResponse<TrainingParticipant>>(`/api/trainings/${trainingId}/participants`, data).then(r => r.data.data),

  updateParticipant: (participantId: number, data: Partial<TrainingParticipantFormData>) =>
    api.put<ApiResponse<TrainingParticipant>>(`/api/trainings/participants/${participantId}`, data).then(r => r.data.data),

  deleteParticipant: (participantId: number) =>
    api.delete(`/api/trainings/participants/${participantId}`),
};
