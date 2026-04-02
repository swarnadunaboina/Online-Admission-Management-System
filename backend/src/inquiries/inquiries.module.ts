import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { Inquiry, InquirySchema } from './schemas/inquiry.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }])],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
