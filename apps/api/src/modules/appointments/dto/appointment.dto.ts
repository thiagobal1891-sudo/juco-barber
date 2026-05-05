import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  IsISO8601,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  barberId: string;

  @IsUUID()
  serviceId: string;

  // Client info (can be a new client or an existing one matched by phone)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  clientPhone: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsISO8601()
  startTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
