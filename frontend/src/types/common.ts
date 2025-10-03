export interface User {
  id: string;
  name: string;
  email: string;
  user_type: any;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'pharmacist' | 'lab_technician';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'in_progress';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  coverageType: string;
  expiryDate: Date;
}