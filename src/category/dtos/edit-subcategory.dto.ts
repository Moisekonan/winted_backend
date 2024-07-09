import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubCategoryDto {
  @ApiProperty({ name: 'name', example: 'Laptop' })
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ example: 1 })
  categoryId: number;
}
