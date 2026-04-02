import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  APPLICATION_FEE = 'application_fee',
  TUITION_FEE = 'tuition_fee',
  REGISTRATION_FEE = 'registration_fee',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NET_BANKING = 'net_banking',
  UPI = 'upi',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
  application: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ type: String, enum: PaymentType, required: true })
  type: PaymentType;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ unique: true, sparse: true })
  transactionId: string;

  @Prop()
  gatewayOrderId: string;

  @Prop({ type: Object })
  gatewayResponse: Record<string, any>;

  @Prop()
  paidAt: Date;

  @Prop()
  refundedAt: Date;

  @Prop()
  failureReason: string;

  @Prop()
  receiptNumber: string;

  @Prop()
  description: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ student: 1 });
PaymentSchema.index({ application: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });
