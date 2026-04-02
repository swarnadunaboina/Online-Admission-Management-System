import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProgramDocument = Program & Document;

@Schema({ timestamps: true })
export class Program {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  code: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({ required: true, trim: true })
  level: string; // undergraduate, postgraduate, diploma, certificate

  @Prop({ required: true })
  duration: string; // e.g., "4 Years", "2 Semesters"

  @Prop({ required: true })
  totalSeats: number;

  @Prop({ default: 0 })
  enrolledSeats: number;

  @Prop({ type: Object })
  eligibilityCriteria: {
    minAge?: number;
    maxAge?: number;
    requiredQualification: string;
    minPercentage?: number;
    subjects?: string[];
    additionalRequirements?: string;
  };

  @Prop({ type: Object })
  fees: {
    applicationFee: number;
    tuitionFee: number;
    registrationFee: number;
    currency: string;
  };

  @Prop([String])
  requiredDocuments: string[];

  @Prop({ type: Object })
  admissionSchedule: {
    applicationStart: Date;
    applicationEnd: Date;
    entranceExamDate?: Date;
    resultDate?: Date;
    enrollmentStart?: Date;
    enrollmentEnd?: Date;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  imageUrl: string;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
ProgramSchema.index({ name: 1, department: 1 });
ProgramSchema.index({ isActive: 1 });
