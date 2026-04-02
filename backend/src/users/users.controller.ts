import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return { data, message: 'User created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    const result = await this.usersService.findAll(page, limit, role, search);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Users retrieved successfully',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  async getStats() {
    const data = await this.usersService.getStats();
    return { data, message: 'Stats retrieved successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { data, message: 'User retrieved successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(id, updateUserDto);
    return { data, message: 'User updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { data: null, message: 'User deleted successfully' };
  }
}
