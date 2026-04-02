import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EligibilityCriteriaDto {
  @IsOptional() @IsNumber() minAge?: number;
  @IsOptional() @IsNumber() maxAge?: number;
  @IsString() requiredQualification: string;
  @IsOptional() @IsNumber() @Min(0) minPercentage?: number;
  @IsOptional() @IsArray() subjects?: string[];
  @IsOptional() @IsString() additionalRequirements?: string;
}

class FeesDto {
  @IsNumber() @Min(0) applicationFee: number;
  @IsNumber() @Min(0) tuitionFee: number;
  @IsNumber() @Min(0) registrationFee: number;
  @IsString() currency: string;
}

class AdmissionScheduleDto {
  @IsString() applicationStart: string;
  @IsString() applicationEnd: string;
  @IsOptional() @IsString() entranceExamDate?: string;
  @IsOptional() @IsString() resultDate?: string;
  @IsOptional() @IsString() enrollmentStart?: string;
  @IsOptional() @IsString() enrollmentEnd?: string;
}

export class CreateProgramDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() department: string;
  @ApiProperty() @IsString() level: string;
  @ApiProperty() @IsString() duration: string;
  @ApiProperty() @IsNumber() @Min(1) totalSeats: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibilityCriteria?: EligibilityCriteriaDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => FeesDto)
  fees: FeesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  requiredDocuments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdmissionScheduleDto)
  admissionSchedule?: AdmissionScheduleDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
