// Application Constants

export const APP_NAME = 'MediCare Hospital Management System';
export const APP_VERSION = '1.0.0';

// Date and Time Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Blood Types
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
] as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PATIENT: 'patient',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician'
} as const;

// Status Options
export const PATIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DISCHARGED: 'discharged'
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
  INSURANCE_PENDING: 'insurance_pending'
} as const;

// Appointment Types
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency',
  SURGERY: 'surgery',
  CHECKUP: 'checkup',
  VACCINATION: 'vaccination'
} as const;

// Departments
export const DEPARTMENTS = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Gastroenterology',
  'General Surgery',
  'Gynecology',
  'Internal Medicine',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Urology'
] as const;

// Specializations
export const SPECIALIZATIONS = [
  'Interventional Cardiology',
  'Pediatric Cardiology',
  'Cosmetic Dermatology',
  'Dermatopathology',
  'Critical Care Medicine',
  'Emergency Pediatrics',
  'Hepatology',
  'Colorectal Surgery',
  'Trauma Surgery',
  'Maternal-Fetal Medicine',
  'Reproductive Endocrinology',
  'Infectious Disease',
  'Rheumatology',
  'Child Neurology',
  'Neurosurgery',
  'Medical Oncology',
  'Radiation Oncology',
  'Sports Medicine',
  'Spine Surgery',
  'Adolescent Medicine',
  'Neonatology',
  'Child Psychiatry',
  'Forensic Psychiatry',
  'Interventional Radiology',
  'Nuclear Medicine',
  'Pediatric Urology',
  'Urologic Oncology'
] as const;

// Lab Test Types
export const LAB_TEST_TYPES = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'Echocardiogram',
  'Colonoscopy',
  'Endoscopy',
  'Biopsy',
  'Allergy Test'
] as const;

// Medicine Categories
export const MEDICINE_CATEGORIES = [
  'Antibiotics',
  'Analgesics',
  'Antacids',
  'Antihistamines',
  'Antihypertensives',
  'Antidiabetics',
  'Vitamins',
  'Supplements',
  'Vaccines',
  'Antiseptics'
] as const;

// Ward Types
export const WARD_TYPES = [
  'General Ward',
  'ICU',
  'CCU',
  'NICU',
  'Pediatric Ward',
  'Maternity Ward',
  'Surgical Ward',
  'Isolation Ward',
  'Emergency Ward'
] as const;

// Bed Types
export const BED_TYPES = [
  'Standard',
  'ICU',
  'CCU',
  'Isolation',
  'Pediatric',
  'Maternity'
] as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Insurance Types
export const INSURANCE_TYPES = [
  'Private Insurance',
  'Medicare',
  'Medicaid',
  'Workers Compensation',
  'Self Pay',
  'Government',
  'Other'
] as const;

// Relationship Types
export const RELATIONSHIP_TYPES = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Friend',
  'Guardian',
  'Other'
] as const;

// Allergy Severity
export const ALLERGY_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe'
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt']
} as const;

// API Endpoints (for mock service setup)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET: '/patients/:id',
    UPDATE: '/patients/:id',
    DELETE: '/patients/:id'
  },
  DOCTORS: {
    LIST: '/doctors',
    CREATE: '/doctors',
    GET: '/doctors/:id',
    UPDATE: '/doctors/:id',
    DELETE: '/doctors/:id'
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: '/appointments/:id',
    UPDATE: '/appointments/:id',
    DELETE: '/appointments/:id'
  }
} as const;