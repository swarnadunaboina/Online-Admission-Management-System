import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  STAFF = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty()
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty()
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  })
  email: string;

  @ApiProperty()
  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ enum: UserRole })
  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty()
  @Prop({ trim: true, required: false })
  phone?: string;

  @ApiProperty()
  @Prop({ trim: true, required: false })
  avatar?: string;

  @ApiProperty()
  @Prop({
    type: Date,
    required: false,
    get: (value: Date) => {
      return value ? new Date(value).toISOString().split('T')[0] : undefined;
    },
    set: (value: string | Date) => {
      return value ? new Date(value) : undefined;
    }
  })
  dateOfBirth?: Date;

  @ApiProperty()
  @Prop({ trim: true, required: false })
  gender?: string;

  @ApiProperty()
  @Prop({ type: Object, required: false })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };

  @ApiProperty()
  @Prop({ default: false, required: false })
  isEmailVerified?: boolean;

  @ApiProperty()
  @Prop({ required: false })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, name: 'email_1' });
UserSchema.index({ role: 1 });
