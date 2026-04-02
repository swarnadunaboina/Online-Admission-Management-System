import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DocumentEntity,
  DocumentRecord,
  DocumentStatus,
  DocumentType,
} from './schemas/document.schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly documentModel: Model<DocumentRecord>,
  ) {}

  async uploadDocument(
    studentId: string,
    applicationId: string,
    type: DocumentType,
    name: string,
    file: Express.Multer.File,
  ): Promise<DocumentRecord> {
    const existingDoc = await this.documentModel.findOne({
      student: new Types.ObjectId(studentId),
      application: new Types.ObjectId(applicationId),
      type,
    });

    if (existingDoc) {
      // Delete old file
      if (fs.existsSync(existingDoc.filePath)) {
        fs.unlinkSync(existingDoc.filePath);
      }
      existingDoc.fileName = file.originalname;
      existingDoc.filePath = file.path;
      existingDoc.fileSize = file.size;
      existingDoc.mimeType = file.mimetype;
      existingDoc.name = name;
      existingDoc.status = DocumentStatus.PENDING;
      existingDoc.remarks = undefined;
      existingDoc.verifiedAt = undefined;
      existingDoc.verifiedBy = undefined;
      return existingDoc.save();
    }

    const document = new this.documentModel({
      student: new Types.ObjectId(studentId),
      application: new Types.ObjectId(applicationId),
      type,
      name,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    return document.save();
  }

  async findByApplication(applicationId: string): Promise<DocumentRecord[]> {
    return this.documentModel
      .find({ application: new Types.ObjectId(applicationId) })
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByStudent(studentId: string): Promise<DocumentRecord[]> {
    return this.documentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('application', 'applicationNumber')
      .sort({ createdAt: -1 });
  }

  async findAll(page = 1, limit = 10, status?: DocumentStatus) {
    const query: any = {};
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.documentModel
        .find(query)
        .populate('student', 'name email')
        .populate('application', 'applicationNumber')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.documentModel.countDocuments(query),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async verifyDocument(
    documentId: string,
    status: DocumentStatus,
    remarks: string,
    verifiedById: string,
  ): Promise<DocumentRecord> {
    const document = await this.documentModel.findById(documentId);
    if (!document) throw new NotFoundException('Document not found');

    document.status = status;
    document.remarks = remarks;
    document.verifiedAt = new Date();
    document.verifiedBy = new Types.ObjectId(verifiedById);

    return document.save();
  }

  async remove(documentId: string, studentId: string): Promise<void> {
    const document = await this.documentModel.findOne({
      _id: documentId,
      student: new Types.ObjectId(studentId),
    });
    if (!document) throw new NotFoundException('Document not found');
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    await document.deleteOne();
  }
}
