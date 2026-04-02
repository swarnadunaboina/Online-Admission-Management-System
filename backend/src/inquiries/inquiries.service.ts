import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Inquiry,
  InquiryDocument,
  InquiryStatus,
} from './schemas/inquiry.schema';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectModel(Inquiry.name) private readonly inquiryModel: Model<InquiryDocument>,
  ) {}

  async create(
    createInquiryDto: CreateInquiryDto,
    studentId?: string,
  ): Promise<InquiryDocument> {
    const inquiry = new this.inquiryModel({
      ...createInquiryDto,
      program: createInquiryDto.programId
        ? new Types.ObjectId(createInquiryDto.programId)
        : undefined,
      student: studentId ? new Types.ObjectId(studentId) : undefined,
    });
    return inquiry.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: InquiryStatus,
    search?: string,
  ) {
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.inquiryModel
        .find(query)
        .populate('program', 'name department')
        .populate('assignedTo', 'name email')
        .populate('student', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.inquiryModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findByStudent(studentId: string, page = 1, limit = 10) {
    const query = { student: new Types.ObjectId(studentId) };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.inquiryModel
        .find(query)
        .populate('program', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.inquiryModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<InquiryDocument> {
    const inquiry = await this.inquiryModel
      .findById(id)
      .populate('program', 'name department')
      .populate('assignedTo', 'name email')
      .populate('student', 'name email');
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  async respond(
    id: string,
    message: string,
    respondedById: string,
    isPublic = true,
  ): Promise<InquiryDocument> {
    const inquiry = await this.inquiryModel.findById(id);
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    if (!inquiry.responses) inquiry.responses = [];
    inquiry.responses.push({
      message,
      respondedBy: new Types.ObjectId(respondedById),
      respondedAt: new Date(),
      isPublic,
    });
    if (inquiry.status === InquiryStatus.NEW) {
      inquiry.status = InquiryStatus.IN_PROGRESS;
    }
    return inquiry.save();
  }

  async updateStatus(
    id: string,
    status: InquiryStatus,
    assignedTo?: string,
  ): Promise<InquiryDocument> {
    const updateData: any = { status };
    if (assignedTo) updateData.assignedTo = new Types.ObjectId(assignedTo);
    if (status === InquiryStatus.RESOLVED) updateData.resolvedAt = new Date();

    const inquiry = await this.inquiryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  async getStats() {
    const statusCounts = await this.inquiryModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await this.inquiryModel.countDocuments();
    return {
      total,
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}
