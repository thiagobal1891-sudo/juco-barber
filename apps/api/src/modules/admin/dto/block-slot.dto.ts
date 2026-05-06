import { IsDateString, IsOptional, IsString } from 'class-validator';

export class BlockSlotDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
