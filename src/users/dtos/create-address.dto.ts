import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAddressInputDto {
  @ApiProperty({ example: '123 Main St', description: 'Address line 1' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 101', description: 'Address line 2', required: false })
  @IsNotEmpty()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'USA', description: 'Country' })
  @IsNotEmpty()
  @IsString()
  country: string;
}