import { IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the location being booked' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ description: 'Department making the booking' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Number of attendees' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  attendees: number;

  @ApiProperty({ description: 'Start time of the booking (ISO format)' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time of the booking (ISO format)' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
