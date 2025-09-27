import { BaseEntity, Address, ContactInfo, Insurance, Status } from './common';

export interface Patient extends BaseEntity {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodType: BloodType;
  address: Address;
  contact: ContactInfo;
  insurance?: Insurance;
  status: Status;
  medicalHistory: MedicalHistory[];
  allergies: Allergy[];
  currentMedications: Medication[];
  admissionDate?: Date;
  dischargeDate?: Date;
  assignedDoctor?: string;
  wardNumber?: string;
  bedNumber?: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface MedicalHistory extends BaseEntity {
  patientId: string;
  condition: string;
  diagnosisDate: Date;
  treatment: string;
  doctorId: string;
  notes: string;
  isActive: boolean;
}

export interface Allergy extends BaseEntity {
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface Medication extends BaseEntity {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
}

export interface Vital {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedAt: Date;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
  notes?: string;
}