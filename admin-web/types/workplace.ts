export interface Workplace {
  id: string;
  name: string;
  latitude: number | string;
  longitude: number | string;
  radiusMeters: number | string;
  maximumSessionHours: number | string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkplaceResponse {
  success: boolean;
  workplace: Workplace;
}

export interface CreateWorkplaceResponse {
  success: boolean;
  message: string;
  workplace: Workplace;
}

export interface UpdateWorkplaceResponse {
  success: boolean;
  message: string;
  workplace: Workplace;
}