import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InquiryDocument = Inquiry & Document;

export enum InquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum InquiryCategory {
  ADMISSION_PROCESS = 'admission_process',
  ELIGIBILITY = 'eligibility',
  DOCUMENTS = 'documents',
  FEES = 'fees',
  SCHOLARSHIP = 'scholarship',
  HOSTEL = 'hostel',
  GENERAL = 'general',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Inquiry {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Program' })
  program: Types.ObjectId;

  @Prop({ type: String, enum: InquiryCategory, default: InquiryCategory.GENERAL })
  category: InquiryCategory;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: InquiryStatus, default: InquiryStatus.NEW })
  status: InquiryStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  student: Types.ObjectId;

  @Prop([{ type: Object }])
  responses: Array<{
    message: string;
    respondedBy: Types.ObjectId;
    respondedAt: Date;
    isPublic: boolean;
  }>;

  @Prop()
  resolvedAt: Date;
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);
InquirySchema.index({ status: 1 });
InquirySchema.index({ email: 1 });
InquirySchema.index({ student: 1 });
