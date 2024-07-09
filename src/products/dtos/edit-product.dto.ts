import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateVisibleProductInputDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  visibility: boolean;
}

export class UpdateProductInputDto {
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
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isInStock?: boolean;

  @ApiProperty({ example: 'Jeux Vidéo' })
  @IsNotEmpty()
  subCategory: string;

  @ApiProperty({ example: 1000 })
  shippingFee: number;

  // @ApiProperty({ example: ['https://example.com/image.jpg'] })
  // @IsNotEmpty()
  // images: string[];

  @ApiProperty({ example: 'Polos' })
  @IsOptional()
  brand: string;

  @ApiProperty({ example: 9900 })
  @IsOptional()
  discount: number;

  @ApiProperty({ example: true })
  @IsOptional()
  visibility: boolean;
}
