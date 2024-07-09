import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';
export class CreatePersonalInputDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: '123456789', description: 'User phone number', required: false })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: UserRole.PERSONAL, description: 'User role' })
  role?: UserRole.PERSONAL;
}