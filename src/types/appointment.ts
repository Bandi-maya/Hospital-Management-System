import { BaseEntity, Status } from './common';

export interface Appointment extends BaseEntity {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: Date;
  isEmergency: boolean;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  reminders: AppointmentReminder[];
}

export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'surgery' | 'checkup' | 'vaccination';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'insurance_pending';

export interface AppointmentReminder extends BaseEntity {
  appointmentId: string;
  type: 'sms' | 'email' | 'push';
  scheduledFor: Date;
  isSent: boolean;
  sentAt?: Date;
  message: string;
}

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  preferredDate: Date;
  preferredTime: string;
  reason: string;
  type: AppointmentType;
  isEmergency?: boolean;
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId: string;
  date: Date;
}

export interface AppointmentFilter {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: Date;
  dateTo?: Date;
  isEmergency?: boolean;
}