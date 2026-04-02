import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Program, ProgramDocument } from './schemas/program.schema';
import { CreateProgramDto } from './dto/create-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectModel(Program.name) private readonly programModel: Model<ProgramDocument>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<ProgramDocument> {
    const program = new this.programModel(createProgramDto);
    return program.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    department?: string,
    level?: string,
    isActive?: boolean,
  ) {
    const query: any = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
    if (department) query.department = { $regex: department, $options: 'i' };
    if (level) query.level = level;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.programModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.programModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<ProgramDocument> {
    const program = await this.programModel.findById(id);
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async update(id: string, updateData: Partial<CreateProgramDto>): Promise<ProgramDocument> {
    const program = await this.programModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async remove(id: string): Promise<void> {
    const program = await this.programModel.findByIdAndDelete(id);
    if (!program) throw new NotFoundException('Program not found');
  }

  async incrementEnrolledSeats(id: string): Promise<void> {
    await this.programModel.findByIdAndUpdate(id, { $inc: { enrolledSeats: 1 } });
  }

  async getDepartments(): Promise<string[]> {
    return this.programModel.distinct('department');
  }
}
