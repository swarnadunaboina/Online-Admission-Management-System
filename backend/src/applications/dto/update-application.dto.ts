import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../schemas/application.schema';

export class UpdateApplicationStatusDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

export class EligibilityCheckDto {
  @ApiPropertyOptional()
  @IsBoolean()
  isEligible: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  failedCriteria?: string[];
}
