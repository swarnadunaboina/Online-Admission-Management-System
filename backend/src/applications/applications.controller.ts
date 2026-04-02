import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  UpdateApplicationStatusDto,
  EligibilityCheckDto,
} from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApplicationStatus } from './schemas/application.schema';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application (Student only)' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async create(
    @CurrentUser('_id') studentId: string,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    const data = await this.applicationsService.create(studentId, createApplicationDto);
    return { data, message: 'Application created successfully' };
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit a draft application (Student only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async submit(
    @Param('id') id: string,
    @CurrentUser('_id') studentId: string,
  ) {
    const data = await this.applicationsService.submit(id, studentId);
    return { data, message: 'Application submitted successfully' };
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current student applications' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async getMyApplications(
    @CurrentUser('_id') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.applicationsService.findByStudent(studentId, page, limit);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Applications retrieved successfully',
    };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get application statistics (Admin/Staff only)' })
  async getStats() {
    const data = await this.applicationsService.getStats();
    return { data, message: 'Statistics retrieved successfully' };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all applications (Admin/Staff only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'programId', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: ApplicationStatus,
    @Query('programId') programId?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.applicationsService.findAll(page, limit, status, programId, search);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Applications retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.applicationsService.findOne(id);
    return { data, message: 'Application retrieved successfully' };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update application status (Admin/Staff only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @CurrentUser('_id') reviewerId: string,
  ) {
    const data = await this.applicationsService.updateStatus(id, updateStatusDto, reviewerId);
    return { data, message: 'Application status updated' };
  }

  @Patch(':id/eligibility')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Perform eligibility check (Admin/Staff only)' })
  async eligibilityCheck(
    @Param('id') id: string,
    @Body() eligibilityDto: EligibilityCheckDto,
    @CurrentUser('_id') reviewerId: string,
  ) {
    const data = await this.applicationsService.performEligibilityCheck(id, eligibilityDto, reviewerId);
    return { data, message: 'Eligibility check completed' };
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign application to staff (Admin only)' })
  async assign(
    @Param('id') id: string,
    @Body('staffId') staffId: string,
  ) {
    const data = await this.applicationsService.assignToStaff(id, staffId);
    return { data, message: 'Application assigned successfully' };
  }

  @Patch(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Withdraw application (Student only)' })
  async withdraw(
    @Param('id') id: string,
    @CurrentUser('_id') studentId: string,
  ) {
    const data = await this.applicationsService.withdraw(id, studentId);
    return { data, message: 'Application withdrawn' };
  }
}
