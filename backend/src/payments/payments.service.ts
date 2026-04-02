import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async initiatePayment(
    studentId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument> {
    const existingCompleted = await this.paymentModel.findOne({
      student: new Types.ObjectId(studentId),
      application: new Types.ObjectId(createPaymentDto.applicationId),
      type: createPaymentDto.type,
      status: PaymentStatus.COMPLETED,
    });
    if (existingCompleted) {
      throw new BadRequestException('Payment for this fee type has already been completed');
    }

    const year = new Date().getFullYear();
    const receiptNumber = `RCP-${year}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payment = new this.paymentModel({
      student: new Types.ObjectId(studentId),
      application: new Types.ObjectId(createPaymentDto.applicationId),
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || 'USD',
      type: createPaymentDto.type,
      paymentMethod: createPaymentDto.paymentMethod,
      description: createPaymentDto.description,
      receiptNumber,
      gatewayOrderId: `ORD-${uuidv4().slice(0, 12).toUpperCase()}`,
      status: PaymentStatus.PROCESSING,
    });

    return payment.save();
  }

  async confirmPayment(
    paymentId: string,
    transactionId: string,
    gatewayResponse?: Record<string, any>,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();
    payment.gatewayResponse = gatewayResponse;

    return payment.save();
  }

  async failPayment(paymentId: string, reason: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason;

    return payment.save();
  }

  async findByStudent(studentId: string, page = 1, limit = 10) {
    const query = { student: new Types.ObjectId(studentId) };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .populate('application', 'applicationNumber')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findByApplication(applicationId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ application: new Types.ObjectId(applicationId) })
      .sort({ createdAt: -1 });
  }

  async findAll(page = 1, limit = 10, status?: PaymentStatus) {
    const query: any = {};
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .populate('student', 'name email')
        .populate('application', 'applicationNumber')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async getRevenue() {
    const result = await this.paymentModel.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    const totalRevenue = result.reduce((sum, r) => sum + r.total, 0);
    return { byType: result, totalRevenue };
  }
}
