import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create({
        ...registerDto,
        role: UserRole.STUDENT,
      });

      const token = this.generateToken(
        String(user._id),
        user.email,
        user.role,
      );

      const { password: _, ...userWithoutPassword } = user.toObject();
      return {
        data: { user: userWithoutPassword, token },
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(String(user._id));

    const token = this.generateToken(
      String(user._id),
      user.email,
      user.role,
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    return {
      data: { user: userWithoutPassword, token },
      message: 'Login successful',
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    return { data: user, message: 'Profile retrieved successfully' };
  }

  async updateProfile(userId: string, updateData: any) {
    const user = await this.usersService.update(userId, updateData);
    return { data: user, message: 'Profile updated successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findOne(userId)).email,
    );
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');
    await this.usersService.update(userId, { password: newPassword });
    return { data: null, message: 'Password changed successfully' };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'secret'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    });
  }
}
