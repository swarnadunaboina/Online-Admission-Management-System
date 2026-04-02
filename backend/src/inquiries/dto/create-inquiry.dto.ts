import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryCategory } from '../schemas/inquiry.schema';

export class CreateInquiryDto {
  @ApiProperty() @IsString() @MaxLength(100) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() programId?: string;

  @ApiPropertyOptional({ enum: InquiryCategory })
  @IsOptional()
  @IsEnum(InquiryCategory)
  category?: InquiryCategory;

  @ApiProperty() @IsString() @MaxLength(200) subject: string;
  @ApiProperty() @IsString() @MaxLength(2000) message: string;
}
