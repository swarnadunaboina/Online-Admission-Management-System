import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { DocumentStatus, DocumentType } from './schemas/document.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/documents',
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only PDF, JPEG, PNG, and WEBP files are allowed'), false);
    }
  },
};

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document (Student only)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @CurrentUser('_id') studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('applicationId') applicationId: string,
    @Body('type') type: DocumentType,
    @Body('name') name: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!applicationId) throw new BadRequestException('applicationId is required');
    if (!type) throw new BadRequestException('Document type is required');
    const data = await this.documentsService.uploadDocument(
      studentId,
      applicationId,
      type,
      name || file.originalname,
      file,
    );
    return { data, message: 'Document uploaded successfully' };
  }

  @Get('application/:applicationId')
  @ApiOperation({ summary: 'Get documents by application' })
  async findByApplication(@Param('applicationId') applicationId: string) {
    const data = await this.documentsService.findByApplication(applicationId);
    return { data, message: 'Documents retrieved successfully' };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student documents' })
  async getMyDocuments(@CurrentUser('_id') studentId: string) {
    const data = await this.documentsService.findByStudent(studentId);
    return { data, message: 'Documents retrieved successfully' };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all documents (Admin/Staff only)' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: DocumentStatus,
  ) {
    const result = await this.documentsService.findAll(page, limit, status);
    return {
      data: result.data,
      meta: { total: result.total, page: result.page, pages: result.pages },
      message: 'Documents retrieved successfully',
    };
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Verify or reject a document (Admin/Staff only)' })
  async verify(
    @Param('id') id: string,
    @Body('status') status: DocumentStatus,
    @Body('remarks') remarks: string,
    @CurrentUser('_id') verifiedById: string,
  ) {
    const data = await this.documentsService.verifyDocument(id, status, remarks, verifiedById);
    return { data, message: 'Document status updated' };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete a document (Student only)' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('_id') studentId: string,
  ) {
    await this.documentsService.remove(id, studentId);
    return { data: null, message: 'Document deleted successfully' };
  }
}
