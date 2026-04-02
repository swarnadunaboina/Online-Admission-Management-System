import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  DOCUMENTS_PENDING = 'documents_pending',
  ELIGIBLE = 'eligible',
  INELIGIBLE = 'ineligible',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAITLISTED = 'waitlisted',
  ENROLLED = 'enrolled',
  WITHDRAWN = 'withdrawn',
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Program', required: true })
  program: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  applicationNumber: string;

  @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.DRAFT })
  status: ApplicationStatus;

  @Prop({ type: Object })
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
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    parentDetails?: {
      fatherName: string;
      fatherOccupation: string;
      motherName: string;
      motherOccupation: string;
      guardianPhone: string;
      annualIncome?: number;
    };
  };

  @Prop({ type: Object })
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
    additionalCertifications?: Array<{
      name: string;
      institution: string;
      year: number;
    }>;
  };

  @Prop([String])
  uploadedDocuments: string[];

  @Prop({ type: Object })
  payment: {
    applicationFeeStatus: string;
    paymentId?: string;
    paidAt?: Date;
    amount?: number;
  };

  @Prop({ type: Object })
  eligibilityCheck: {
    isEligible?: boolean;
    checkedAt?: Date;
    checkedBy?: Types.ObjectId;
    remarks?: string;
    failedCriteria?: string[];
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop()
  submittedAt: Date;

  @Prop()
  reviewedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  @Prop([{ type: Object }])
  remarks: Array<{
    text: string;
    addedBy: Types.ObjectId;
    addedAt: Date;
    isInternal: boolean;
  }>;

  @Prop({ trim: true })
  adminNotes: string;

  @Prop({ default: 0 })
  priority: number;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ student: 1 });
ApplicationSchema.index({ program: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ applicationNumber: 1 });
ApplicationSchema.index({ submittedAt: -1 });

ApplicationSchema.pre('save', function (next) {
  if (!this.applicationNumber && this.status !== ApplicationStatus.DRAFT) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    this.applicationNumber = `APP-${year}-${random}`;
  }
  next();
});
