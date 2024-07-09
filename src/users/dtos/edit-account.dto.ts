import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/common/enums/user-role.enum";

export class UpdateUserInputDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email', required: false })
  email?: string;

  @ApiProperty({ example: 'password123', description: 'User password', required: false })
  password?: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  lastName?: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  firstName?: string;

  @ApiProperty({ example: '123456789', description: 'User phone number', required: false })
  phone?: string;

  @ApiProperty({ example: 'Marcory', description: 'User address' })
  addressLine1: string;

  @ApiProperty({ example: 'Riviera', description: 'User address2' })
  addressLine2?: string;

  @ApiProperty({ example: 'Côte d\'Ivoire', description: 'User country' })
  country: string;

  @ApiProperty({ example: 'Abidjan', description: 'User city' })
  city: string;

  @ApiProperty({ example: UserRole.USER, description: 'role' })
  role?: UserRole;
}