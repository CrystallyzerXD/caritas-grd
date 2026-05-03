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

export type UserRole = 'ADMIN' | 'GRD_SPECIALIST' | 'BRIGADISTA' | 'COMITE_DONACIONES' | 'AUTHORIZED_USER' | 'JEFA_OGP' | 'ALMACEN';

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
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'FOLLOW_UP' | 'EN_EVALUACION' | 'APROBADO' | 'ATENDIDO' | 'EN_SEGUIMIENTO' | 'CERRADO';
export type AffectationLevel = 'LEVE' | 'MODERADO' | 'SEVERO';
export type SocialRiskLevel = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

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
  caseCode?: string;
  reportDate?: string;
  alertSource?: string;
  affectationLevel?: AffectationLevel;
  affectedFamilies?: number;
  vulnerableGroups?: string;
  urgentNeeds?: string;
  socialRiskAssessment?: SocialRiskLevel;
  articulatedInstitutions?: string;
  reportCount?: number;
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
  reportDate?: string;
  alertSource?: string;
  affectationLevel?: AffectationLevel;
  affectedFamilies?: number;
  vulnerableGroups?: string;
  urgentNeeds?: string;
  socialRiskAssessment?: SocialRiskLevel;
  articulatedInstitutions?: string;
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
  familyId?: number | null;   // null = standalone
  fullName: string;
  dni?: string;
  birthDate?: string;
  sex?: string;
  phone?: string;
  damageType?: string;
}

export interface AffectedPersonFormData {
  fullName: string;
  dni?: string;
  birthDate?: string;
  sex?: string;
  phone?: string;
  damageType?: string;
}

// Affected Families
export interface AffectedFamily {
  id: number;
  incidentId: number;
  name?: string;
  address?: string;
  observations?: string;
  members: AffectedPerson[];
  createdAt: string;
}

export interface AffectedFamilyFormData {
  name?: string;
  address?: string;
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

// Brigadistas Parroquiales
export interface Brigadista {
  id: number;
  fullName: string;
  dni?: string;
  phone?: string;
  email?: string;
  parishId?: number;
  parish?: string;
  pastoralRole?: string;
  available: boolean;
  latitude?: number;
  longitude?: number;
  active: boolean;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BrigadistaFormData {
  fullName: string;
  dni?: string;
  phone?: string;
  email?: string;
  parishId?: number;
  pastoralRole?: string;
  available?: boolean;
  latitude?: number;
  longitude?: number;
  active?: boolean;
  observations?: string;
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
  totalTrainings: number;
  totalParticipants: number;
  certifiedParticipants: number;
  totalBrigadistas: number;
  activeBrigadistas: number;
  incidentsByEventType: Record<string, number>;
  incidentsByDistrict: Record<string, number>;
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

// Training (Módulo 1)
export type TrainingModality = 'SINCRONICA' | 'ASINCRONICA' | 'MIXTA';
export type TrainingStatus = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';
export type CertificationStatus = 'APROBADO' | 'NO_APROBADO' | 'PENDIENTE';

export interface Training {
  id: number;
  trainingCode: string;
  name: string;
  modality: TrainingModality;
  startDate: string;
  endDate?: string;
  parishId?: number;
  parish?: string;
  responsibleId?: number;
  responsible?: string;
  status: TrainingStatus;
  description?: string;
  participantCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingFormData {
  name: string;
  modality: TrainingModality;
  startDate: string;
  endDate?: string;
  parishId?: number;
  responsibleId?: number;
  status: TrainingStatus;
  description?: string;
}

export interface TrainingParticipant {
  id: number;
  trainingId: number;
  dni?: string;
  fullName: string;
  age?: number;
  phone?: string;
  email?: string;
  pastoralRole?: string;
  attendance: AttendanceStatus;
  initialScore?: number;
  finalScore?: number;
  certificationStatus: CertificationStatus;
  observations?: string;
  createdAt: string;
}

export interface TrainingParticipantFormData {
  dni?: string;
  fullName: string;
  age?: number;
  phone?: string;
  email?: string;
  pastoralRole?: string;
  attendance: AttendanceStatus;
  initialScore?: number;
  finalScore?: number;
  certificationStatus: CertificationStatus;
  observations?: string;
}

// Incident Reports (Módulo 2 - 3 tipos)
export type ReportType = 'PRIMERA_VISITA' | 'ENTREGA_DONACION' | 'SEGUIMIENTO';

export interface IncidentReport {
  id: number;
  incidentId: number;
  caseCode?: string;
  reportType: ReportType;
  createdById?: number;
  createdByName?: string;
  observations?: string;
  // PRIMERA_VISITA
  visitMotivo?: string;
  visitObjectives?: string;
  eventDescription?: string;
  habitabilityConditions?: string;
  familyComposition?: string;
  vulnerabilityLevel?: string;
  priorityNeeds?: string;
  initialRecommendation?: string;
  // ENTREGA_DONACION
  deliveryCode?: string;
  deliveryDate?: string;
  deliveryPlace?: string;
  beneficiaryName?: string;
  beneficiaryDni?: string;
  aidType?: string;
  kitComposition?: string;
  deliveryResponsible?: string;
  parroquialActor?: string;
  deliveryEvidence?: string;
  // SEGUIMIENTO
  followUpDate?: string;
  followUpMedium?: string;
  currentSituation?: string;
  aidUsage?: string;
  persistentNeeds?: string;
  referralsMade?: string;
  technicalRecommendation?: string;
  finalStatus?: string;
  createdAt: string;
}

export interface IncidentReportFormData {
  reportType: ReportType;
  observations?: string;
  visitMotivo?: string;
  visitObjectives?: string;
  eventDescription?: string;
  habitabilityConditions?: string;
  familyComposition?: string;
  vulnerabilityLevel?: string;
  priorityNeeds?: string;
  initialRecommendation?: string;
  deliveryDate?: string;
  deliveryPlace?: string;
  beneficiaryName?: string;
  beneficiaryDni?: string;
  aidType?: string;
  kitComposition?: string;
  deliveryResponsible?: string;
  parroquialActor?: string;
  deliveryEvidence?: string;
  followUpDate?: string;
  followUpMedium?: string;
  currentSituation?: string;
  aidUsage?: string;
  persistentNeeds?: string;
  referralsMade?: string;
  technicalRecommendation?: string;
  finalStatus?: string;
}
