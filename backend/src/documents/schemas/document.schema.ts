import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentRecord = DocumentEntity & Document;

export enum DocumentStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum DocumentType {
  MARKSHEET = 'marksheet',
  CERTIFICATE = 'certificate',
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
  PASSPORT_PHOTO = 'passport_photo',
  BIRTH_CERTIFICATE = 'birth_certificate',
  CASTE_CERTIFICATE = 'caste_certificate',
  INCOME_CERTIFICATE = 'income_certificate',
  MIGRATION_CERTIFICATE = 'migration_certificate',
  CHARACTER_CERTIFICATE = 'character_certificate',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class DocumentEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  application: Types.ObjectId;

  @Prop({ type: String, enum: DocumentType, required: true })
  type: DocumentType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop()
  fileSize: number;

  @Prop()
  mimeType: string;

  @Prop({ type: String, enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Prop()
  remarks: string;

  @Prop()
  verifiedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy: Types.ObjectId;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
DocumentSchema.index({ student: 1, application: 1 });
DocumentSchema.index({ status: 1 });
