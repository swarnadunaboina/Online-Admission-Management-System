import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new student account' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return this.authService.register(registerDto);
    } catch (error) {
      console.error('Registration controller error:', error);
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('_id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('_id') userId: string,
    @Body() updateData: any,
  ) {
    return this.authService.updateProfile(userId, updateData);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('_id') userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
