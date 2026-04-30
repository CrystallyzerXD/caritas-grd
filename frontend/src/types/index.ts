// Auth
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  parish?: string;
  active?: boolean;
}

export type UserRole = 'ADMIN' | 'GRD_SPECIALIST' | 'BRIGADISTA' | 'AUTHORIZED_USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  expiresIn: number;
}

// API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Incidents
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'FOLLOW_UP';

export interface Incident {
  id: number;
  eventType: string;
  eventTypeId?: number;
  description: string;
  cause?: string;
  losses?: string;
  actionsTaken?: string;
  status: IncidentStatus;
  incidentDate: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  district: string;
  districtId?: number;
  reportedBy?: string;
  createdAt: string;
  updatedAt?: string;
  affectedPersonsCount?: number;
}

export interface IncidentFormData {
  eventTypeId: number;
  description: string;
  cause?: string;
  losses?: string;
  actionsTaken?: string;
  status: IncidentStatus;
  incidentDate: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  districtId: number;
}

export interface IncidentFilters {
  page: number;
  size: number;
  status?: string;
  eventTypeId?: number;
  districtId?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Affected Persons
export interface AffectedPerson {
  id: number;
  incidentId: number;
  fullName: string;
  dni?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  address?: string;
  affectationType?: string;
  observations?: string;
}

export interface AffectedPersonFormData {
  fullName: string;
  dni?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  address?: string;
  affectationType?: string;
  observations?: string;
}

// Evidence
export interface Evidence {
  id: number;
  incidentId: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

// Environmental
export type EnvironmentalStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Environmental {
  id: number;
  title: string;
  description?: string;
  responsible?: string;
  location?: string;
  district: string;
  districtId?: number;
  startDate: string;
  endDate?: string;
  status: EnvironmentalStatus;
  category?: string;
  createdAt: string;
}

export interface EnvironmentalFormData {
  title: string;
  description?: string;
  responsible?: string;
  location?: string;
  districtId: number;
  startDate: string;
  endDate?: string;
  status: EnvironmentalStatus;
  category?: string;
}

// Reports / Dashboard
// Matches backend DashboardDto exactly
export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  closedIncidents: number;
  followUpIncidents: number;
  totalAffectedPersons: number;
  totalEvidences: number;
  totalEnvironmentalInitiatives: number;
  plannedInitiatives: number;
  inProgressInitiatives: number;
  completedInitiatives: number;
  incidentsByEventType: Record<string, number>;
  incidentsByDistrict: Record<string, number>;
  initiativesByCategory: Record<string, number>;
}

// Catalogs
export interface EventType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface District {
  id: number;
  name: string;
  province?: string;
  active: boolean;
}

export interface Parish {
  id: number;
  name: string;
  districtId?: number;
  district?: string;
  active: boolean;
}

// Users (admin)
export interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  parishId?: number;
  active: boolean;
}
