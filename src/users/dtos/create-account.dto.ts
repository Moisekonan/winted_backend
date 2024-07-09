import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserInputDto {
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

  @ApiProperty({ example: '123456789', description: 'User phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'Marcory', description: 'User address' })
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ example: 'Riviera', description: 'User address2' })
  addressLine2?: string;

  @ApiProperty({ example: "Côte d'Ivoire", description: 'User country' })
  country?: string;

  @ApiProperty({ example: 'Abidjan', description: 'User city' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: UserRole.USER, description: 'role' })
  role?: UserRole;
}
