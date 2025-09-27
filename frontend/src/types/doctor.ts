import { BaseEntity, Address, ContactInfo, Status } from './common';

export interface Doctor extends BaseEntity {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: Specialization[];
  qualification: string[];
  experience: number;
  licenseNumber: string;
  department: string;
  status: Status;
  address: Address;
  availability: DoctorAvailability[];
  consultationFee: number;
  rating: number;
  totalPatients: number;
  totalAppointments: number;
}

export interface Specialization {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface DoctorAvailability extends BaseEntity {
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  maxAppointments: number;
  slotDuration: number; // in minutes
}

export interface DoctorSchedule extends BaseEntity {
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentSlots: AppointmentSlot[];
  notes?: string;
}

export interface AppointmentSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointmentId?: string;
  patientId?: string;
}

export interface DoctorPerformance {
  doctorId: string;
  month: number;
  year: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalRevenue: number;
  patientSatisfaction: number;
}