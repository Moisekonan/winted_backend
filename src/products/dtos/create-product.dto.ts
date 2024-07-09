import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductInputDto {
  @ApiProperty({ example: 'Smartphone' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'A powerful smartphone' })
  @IsString()
  @IsOptional()
  subTitle: string;

  @ApiProperty({ example: 'A powerful smartphone with advanced features' })
  @IsString()
  description: string;

  @ApiProperty({ example: 9999 })
  // @IsNumber()
  // @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  // @IsNumber()
  // @Min(0)
  quantity: number;

  @ApiProperty({ example: 'Jeux Vidéo' })
  @IsNotEmpty()
  subCategory: string;

  @ApiProperty({ example: 1000 })
  shippingFee: number;

  @ApiProperty({ example: 'Polos' })
  @IsOptional()
  brand: string;

  @ApiProperty({ example: 9900 })
  @IsOptional()
  discount: number;
}
