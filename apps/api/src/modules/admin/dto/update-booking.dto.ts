import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['reserved', 'cancelled', 'completed'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
