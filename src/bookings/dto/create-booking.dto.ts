import { IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the location being booked', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({ description: 'Department making the booking', example: 'EFM' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Number of attendees', example: 5 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  attendees: number;

  @ApiProperty({ description: 'Start time of the booking (ISO format)', example: '2026-06-15T10:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time of the booking (ISO format)', example: '2026-06-15T11:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
