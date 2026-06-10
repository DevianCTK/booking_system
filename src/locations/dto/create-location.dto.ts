import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../enums/location-type.enum';

export class CreateLocationDto {
  @ApiProperty({ description: 'The name of the location', example: 'Meeting Room 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique identifier number/code for the location', example: 'A-01-01' })
  @IsString()
  @IsNotEmpty()
  locationNumber: string;

  @ApiPropertyOptional({ enum: LocationType, description: 'Type of the location', example: LocationType.ROOM })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({ description: 'Department associated with the location', example: 'EFM' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Capacity of the location', example: 10 })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Days the location is open (e.g., ["Mon", "Tue"])', type: [String], example: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  openDays?: string[];

  @ApiPropertyOptional({ description: 'Opening time (HH:mm format)', example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'openFrom must be a valid time in HH:mm format' })
  openFrom?: string;

  @ApiPropertyOptional({ description: 'Closing time (HH:mm format)', example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'openTo must be a valid time in HH:mm format' })
  openTo?: string;

  @ApiPropertyOptional({ description: 'ID of the parent location', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
