import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @IsString() street: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() country: string;
  @IsString() zipCode: string;
}

class ParentDetailsDto {
  @IsString() fatherName: string;
  @IsOptional() @IsString() fatherOccupation?: string;
  @IsString() motherName: string;
  @IsOptional() @IsString() motherOccupation?: string;
  @IsString() guardianPhone: string;
  @IsOptional() @IsNumber() annualIncome?: number;
}

class PersonalDetailsDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() dateOfBirth: string;
  @IsString() gender: string;
  @IsString() nationality: string;
  @IsOptional() @IsString() religion?: string;
  @IsOptional() @IsString() category?: string;
  @IsString() phone: string;
  @IsOptional() @IsString() alternatePhone?: string;
  @IsEmail() email: string;
  @ValidateNested() @Type(() => AddressDto) address: AddressDto;
  @IsOptional() @ValidateNested() @Type(() => ParentDetailsDto) parentDetails?: ParentDetailsDto;
}

class AcademicDetailsDto {
  @IsString() lastQualification: string;
  @IsString() institution: string;
  @IsString() boardUniversity: string;
  @IsNumber() @Min(1950) @Max(new Date().getFullYear()) yearOfPassing: number;
  @IsNumber() @Min(0) @Max(100) percentage: number;
  @IsOptional() @IsArray() subjects?: string[];
  @IsOptional() @IsString() rollNumber?: string;
  @IsOptional() @IsString() certificateNumber?: string;
  @IsOptional() @IsNumber() @Min(0) gapYears?: number;
  @IsOptional() @IsString() gapReason?: string;
}

export class CreateApplicationDto {
  @ApiProperty() @IsString() program: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PersonalDetailsDto)
  personalDetails: PersonalDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AcademicDetailsDto)
  academicDetails: AcademicDetailsDto;
}
