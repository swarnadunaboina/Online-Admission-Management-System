import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  UpdateApplicationStatusDto,
  EligibilityCheckDto,
} from './dto/update-application.dto';
import { ProgramsService } from '../programs/programs.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    private readonly programsService: ProgramsService,
  ) {}

  async create(
    studentId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationDocument> {
    const existingApplication = await this.applicationModel.findOne({
      student: new Types.ObjectId(studentId),
      program: new Types.ObjectId(createApplicationDto.program),
      status: { $nin: [ApplicationStatus.WITHDRAWN, ApplicationStatus.REJECTED] },
    });
    if (existingApplication) {
      throw new BadRequestException(
        'You already have an active application for this program',
      );
    }

    await this.programsService.findOne(createApplicationDto.program);

    const application = new this.applicationModel({
      student: new Types.ObjectId(studentId),
      program: new Types.ObjectId(createApplicationDto.program),
      personalDetails: createApplicationDto.personalDetails,
      academicDetails: createApplicationDto.academicDetails,
      status: ApplicationStatus.DRAFT,
      payment: { applicationFeeStatus: 'pending' },
    });

    return application.save();
  }

  async submit(applicationId: string, studentId: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findOne({
      _id: applicationId,
      student: new Types.ObjectId(studentId),
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Application has already been submitted');
    }

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    application.applicationNumber = `APP-${year}-${random}`;
    application.status = ApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();
    return application.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: ApplicationStatus,
    programId?: string,
    search?: string,
  ) {
    const query: any = {};
    if (status) query.status = status;
    if (programId) query.program = new Types.ObjectId(programId);

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.applicationModel
        .find(query)
        .populate('student', 'name email phone')
        .populate('program', 'name department level')
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ submittedAt: -1, createdAt: -1 }),
      this.applicationModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findByStudent(studentId: string, page = 1, limit = 10) {
    const query = { student: new Types.ObjectId(studentId) };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.applicationModel
        .find(query)
        .populate('program', 'name department level fees')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.applicationModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel
      .findById(id)
      .populate('student', 'name email phone')
      .populate('program')
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email');
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
    reviewerId: string,
  ): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(id);
    if (!application) throw new NotFoundException('Application not found');

    application.status = updateStatusDto.status;
    application.reviewedAt = new Date();
    application.reviewedBy = new Types.ObjectId(reviewerId);

    if (updateStatusDto.remarks) {
      if (!application.remarks) application.remarks = [];
      application.remarks.push({
        text: updateStatusDto.remarks,
        addedBy: new Types.ObjectId(reviewerId),
        addedAt: new Date(),
        isInternal: updateStatusDto.isInternal ?? false,
      });
    }

    if (updateStatusDto.status === ApplicationStatus.ENROLLED) {
      await this.programsService.incrementEnrolledSeats(
        String(application.program),
      );
    }

    return application.save();
  }

  async performEligibilityCheck(
    id: string,
    eligibilityDto: EligibilityCheckDto,
    reviewerId: string,
  ): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(id);
    if (!application) throw new NotFoundException('Application not found');

    application.eligibilityCheck = {
      isEligible: eligibilityDto.isEligible,
      checkedAt: new Date(),
      checkedBy: new Types.ObjectId(reviewerId),
      remarks: eligibilityDto.remarks,
      failedCriteria: eligibilityDto.failedCriteria,
    };

    application.status = eligibilityDto.isEligible
      ? ApplicationStatus.ELIGIBLE
      : ApplicationStatus.INELIGIBLE;

    return application.save();
  }

  async assignToStaff(
    applicationId: string,
    staffId: string,
  ): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findByIdAndUpdate(
      applicationId,
      { assignedTo: new Types.ObjectId(staffId) },
      { new: true },
    );
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async withdraw(applicationId: string, studentId: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findOne({
      _id: applicationId,
      student: new Types.ObjectId(studentId),
    });
    if (!application) throw new NotFoundException('Application not found');
    if ([ApplicationStatus.ENROLLED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN].includes(application.status)) {
      throw new BadRequestException('Cannot withdraw this application');
    }
    application.status = ApplicationStatus.WITHDRAWN;
    return application.save();
  }

  async getStats() {
    const statusCounts = await this.applicationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await this.applicationModel.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.applicationModel.countDocuments({
      createdAt: { $gte: today },
    });

    return {
      total,
      today: todayCount,
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}
