export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Program {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  department: string;
  level: string;
  duration: string;
  totalSeats: number;
  enrolledSeats: number;
  eligibilityCriteria?: {
    minAge?: number;
    maxAge?: number;
    requiredQualification: string;
    minPercentage?: number;
    subjects?: string[];
    additionalRequirements?: string;
  };
  fees: {
    applicationFee: number;
    tuitionFee: number;
    registrationFee: number;
    currency: string;
  };
  requiredDocuments?: string[];
  admissionSchedule?: {
    applicationStart: string;
    applicationEnd: string;
    entranceExamDate?: string;
    resultDate?: string;
    enrollmentStart?: string;
    enrollmentEnd?: string;
  };
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_pending'
  | 'eligible'
  | 'ineligible'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'enrolled'
  | 'withdrawn';

export interface Application {
  _id: string;
  student: User | string;
  program: Program | string;
  applicationNumber?: string;
  status: ApplicationStatus;
  personalDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    religion?: string;
    category?: string;
    phone: string;
    alternatePhone?: string;
    email: string;
    address: Address;
    parentDetails?: {
      fatherName: string;
      fatherOccupation?: string;
      motherName: string;
      motherOccupation?: string;
      guardianPhone: string;
      annualIncome?: number;
    };
  };
  academicDetails: {
    lastQualification: string;
    institution: string;
    boardUniversity: string;
    yearOfPassing: number;
    percentage: number;
    subjects?: string[];
    rollNumber?: string;
    certificateNumber?: string;
    gapYears?: number;
    gapReason?: string;
  };
  uploadedDocuments?: string[];
  payment?: {
    applicationFeeStatus: string;
    paymentId?: string;
    paidAt?: string;
    amount?: number;
  };
  eligibilityCheck?: {
    isEligible?: boolean;
    checkedAt?: string;
    remarks?: string;
    failedCriteria?: string[];
  };
  assignedTo?: User | string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: User | string;
  remarks?: Array<{
    text: string;
    addedBy: string;
    addedAt: string;
    isInternal: boolean;
  }>;
  createdAt: string;
}

export type DocumentStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type DocumentType =
  | 'marksheet'
  | 'certificate'
  | 'id_proof'
  | 'address_proof'
  | 'passport_photo'
  | 'birth_certificate'
  | 'caste_certificate'
  | 'income_certificate'
  | 'migration_certificate'
  | 'character_certificate'
  | 'other';

export interface Document {
  _id: string;
  student: User | string;
  application: Application | string;
  type: DocumentType;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  remarks?: string;
  verifiedAt?: string;
  verifiedBy?: User | string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'application_fee' | 'tuition_fee' | 'registration_fee';
export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'upi'
  | 'wallet'
  | 'bank_transfer';

export interface Payment {
  _id: string;
  application: Application | string;
  student: User | string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
}

export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type InquiryCategory =
  | 'admission_process'
  | 'eligibility'
  | 'documents'
  | 'fees'
  | 'scholarship'
  | 'hostel'
  | 'general'
  | 'other';

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  program?: Program | string;
  category: InquiryCategory;
  subject: string;
  message: string;
  status: InquiryStatus;
  assignedTo?: User | string;
  student?: User | string;
  responses?: Array<{
    message: string;
    respondedBy: string;
    respondedAt: string;
    isPublic: boolean;
  }>;
  resolvedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  applications: {
    total: number;
    today: number;
    byStatus: Record<ApplicationStatus, number>;
  };
  users: {
    total: number;
    students: number;
    staff: number;
    admins: number;
  };
  inquiries: {
    total: number;
    byStatus: Record<InquiryStatus, number>;
  };
  revenue?: {
    totalRevenue: number;
    byType: Array<{ _id: string; total: number; count: number }>;
  };
}
