import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ name: 'name', example: 'ELECTRONICS'})
  @IsNotEmpty()
  name: string;
}
