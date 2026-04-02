import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    // Create user with all data
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    
    try {
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    role?: UserRole,
    search?: string,
  ): Promise<{ data: UserDocument[]; total: number; page: number; pages: number }> {
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }
    
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  async getStats(): Promise<{
    total: number;
    students: number;
    staff: number;
    admins: number;
  }> {
    const [total, students, staff, admins] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
      this.userModel.countDocuments({ role: UserRole.STAFF }),
      this.userModel.countDocuments({ role: UserRole.ADMIN }),
    ]);
    return { total, students, staff, admins };
  }
}
