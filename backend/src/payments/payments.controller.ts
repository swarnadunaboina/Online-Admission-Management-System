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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from './schemas/payment.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Initiate a payment (Student only)' })
  @HttpCode(HttpStatus.CREATED)
  async initiate(
    @CurrentUser('_id') studentId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const data = await this.paymentsService.initiatePayment(studentId, createPaymentDto);
    return { data, message: 'Payment initiated successfully' };
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Confirm a payment after gateway success' })
  async confirm(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string,
    @Body('gatewayResponse') gatewayResponse?: Record<string, any>,
  ) {
    const data = await this.paymentsService.confirmPayment(id, transactionId, gatewayResponse);
    return { data, message: 'Payment confirmed successfully' };
  }

  @Patch(':id/fail')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Mark payment as failed' })
  async fail(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const data = await this.paymentsService.failPayment(id, reason);
    return { data, message: 'Payment marked as failed' };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student payment history' })
  async getMyPayments(
    @CurrentUser('_id') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.paymentsService.findByStudent(studentId, page, limit);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Payments retrieved successfully',
    };
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get payments by application' })
  async findByApplication(@Param('applicationId') applicationId: string) {
    const data = await this.paymentsService.findByApplication(applicationId);
    return { data, message: 'Payments retrieved successfully' };
  }

  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue statistics (Admin only)' })
  async getRevenue() {
    const data = await this.paymentsService.getRevenue();
    return { data, message: 'Revenue statistics retrieved' };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all payments (Admin/Staff only)' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: PaymentStatus,
  ) {
    const result = await this.paymentsService.findAll(page, limit, status);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Payments retrieved successfully',
    };
  }
}
