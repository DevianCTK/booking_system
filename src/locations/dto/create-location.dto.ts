import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../enums/location-type.enum';

export class CreateLocationDto {
  @ApiProperty({ description: 'The name of the location' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique identifier number/code for the location' })
  @IsString()
  @IsNotEmpty()
  locationNumber: string;

  @ApiPropertyOptional({ enum: LocationType, description: 'Type of the location' })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({ description: 'Department associated with the location' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Capacity of the location' })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Days the location is open (e.g., ["Mon", "Tue"])', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  openDays?: string[];

  @ApiPropertyOptional({ description: 'Opening time (HH:mm format)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'openFrom must be a valid time in HH:mm format' })
  openFrom?: string;

  @ApiPropertyOptional({ description: 'Closing time (HH:mm format)' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'openTo must be a valid time in HH:mm format' })
  openTo?: string;

  @ApiPropertyOptional({ description: 'ID of the parent location' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
