import {
  IsEnum,
  IsString,
  Matches,
} from 'class-validator';
import { DayOfWeek } from '@barberos/types';

export class SetAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}

export class BulkSetAvailabilityDto {
  schedules: SetAvailabilityDto[];
}
