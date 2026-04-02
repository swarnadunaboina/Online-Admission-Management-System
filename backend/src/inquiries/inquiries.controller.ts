import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from './schemas/inquiry.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an inquiry (public or authenticated)' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInquiryDto: CreateInquiryDto,
    @Query('studentId') studentId?: string,
  ) {
    const data = await this.inquiriesService.create(createInquiryDto, studentId);
    return { data, message: 'Inquiry submitted successfully' };
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student inquiries' })
  async getMyInquiries(
    @CurrentUser('_id') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.inquiriesService.findByStudent(studentId, page, limit);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Inquiries retrieved successfully',
    };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get inquiry statistics' })
  async getStats() {
    const data = await this.inquiriesService.getStats();
    return { data, message: 'Statistics retrieved' };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all inquiries (Admin/Staff only)' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: InquiryStatus,
    @Query('search') search?: string,
  ) {
    const result = await this.inquiriesService.findAll(page, limit, status, search);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Inquiries retrieved successfully',
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get inquiry by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.inquiriesService.findOne(id);
    return { data, message: 'Inquiry retrieved successfully' };
  }

  @Post(':id/respond')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Respond to an inquiry (Admin/Staff only)' })
  async respond(
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('isPublic') isPublic: boolean,
    @CurrentUser('_id') respondedById: string,
  ) {
    const data = await this.inquiriesService.respond(id, message, respondedById, isPublic);
    return { data, message: 'Response added successfully' };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update inquiry status (Admin/Staff only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InquiryStatus,
    @Body('assignedTo') assignedTo?: string,
  ) {
    const data = await this.inquiriesService.updateStatus(id, status, assignedTo);
    return { data, message: 'Inquiry status updated' };
  }
}
