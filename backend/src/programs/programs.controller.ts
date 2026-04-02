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
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new program (Admin/Staff only)' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProgramDto: CreateProgramDto) {
    const data = await this.programsService.create(createProgramDto);
    return { data, message: 'Program created successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all programs (public)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('level') level?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
    const result = await this.programsService.findAll(page, limit, search, department, level, activeFilter);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Programs retrieved successfully',
    };
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  async getDepartments() {
    const data = await this.programsService.getDepartments();
    return { data, message: 'Departments retrieved' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.programsService.findOne(id);
    return { data, message: 'Program retrieved successfully' };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update program (Admin/Staff only)' })
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateProgramDto>) {
    const data = await this.programsService.update(id, updateData);
    return { data, message: 'Program updated successfully' };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete program (Admin only)' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.programsService.remove(id);
    return { data: null, message: 'Program deleted successfully' };
  }
}
