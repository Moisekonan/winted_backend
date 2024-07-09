import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { CoreOutput } from 'src/common/dao/output.dto';
import { AddressOutputDto } from './dtos/address.dto';
import { CreateUserInputDto } from './dtos/create-account.dto';
import { UserOutputDto } from './dtos/user.dto';
import { UpdateUserInputDto } from './dtos/edit-account.dto';
import { CreateAddressInputDto } from './dtos/create-address.dto';
import { UpdateAddressInputDto } from './dtos/update-address.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminPersonalSellerGuard } from 'src/common/guards/admin-personal.guard';
import { IResponseUser } from 'src/common/dao/response';
import { CreatePersonalInputDto } from './dtos/create-personal.dto';

@Controller('users')
@ApiTags('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'It will return the user in the response',
    type: CoreOutput,
  })
  async signup(@Body() createUserDto: CreateUserInputDto): Promise<CoreOutput> {
    return this.usersService.signup(createUserDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserOutputDto,
  })
  async getUser(@Req() { user }: RequestWithUser): Promise<IResponseUser> {
    return this.usersService.findById(user['userId']);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({
    status: 200,
    description: 'User details updated',
    type: CoreOutput,
  })
  async updateUser(
    @Req() { user }: RequestWithUser,
    @Body() updateUserDto: UpdateUserInputDto,
  ): Promise<IResponseUser> {
    return this.usersService.updateProfile(user['userId'], updateUserDto);
  }

  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IResponseUser> {
    return this.usersService.deleteUser(id);
  }

  // Address
  @UseGuards(JwtAuthGuard)
  @Post('address')
  @ApiOperation({ summary: 'Add user address' })
  @ApiResponse({
    status: 201,
    description: 'Address added',
    type: CoreOutput,
  })
  async addAddress(
    @Req() { user }: RequestWithUser,
    @Body() addressDto: CreateAddressInputDto,
  ): Promise<CoreOutput> {
    return this.usersService.addAddress(addressDto, user['userId']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('address')
  @ApiOperation({ summary: 'Get user address' })
  @ApiResponse({
    status: 200,
    description: 'User address',
    type: AddressOutputDto,
  })
  async readAddress(
    @Req() { user }: RequestWithUser,
  ): Promise<AddressOutputDto> {
    return this.usersService.readAddress(user['userId']);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('address')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({
    status: 200,
    description: 'User address updated',
    type: CoreOutput,
  })
  async updateAddress(
    @Req() { user }: RequestWithUser,
    @Body() updateAddressDto: UpdateAddressInputDto,
  ): Promise<CoreOutput> {
    return this.usersService.updateAddress(user['userId'], updateAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('address')
  @ApiOperation({ summary: 'Delete user address' })
  @ApiResponse({
    status: 200,
    description: 'User address deleted',
    type: CoreOutput,
  })
  async deleteAddress(@Req() { user }: RequestWithUser): Promise<CoreOutput> {
    return this.usersService.deleteAddress(user['userId']);
  }

  // ADMIN
  @Post('promote-to-admin/:id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async promoteToAdmin(@Param('id', ParseIntPipe) userPromoteId: number) {
    return this.usersService.promoteToAdmin(userPromoteId);
  }

  @Post('demote-to-user/:id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async demoteToUser(@Param('id', ParseIntPipe) userDemoteId: number) {
    return this.usersService.demoteToUser(userDemoteId);
  }

  @Post('personal')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async personal(@Body() personalDto: CreatePersonalInputDto) {
    return this.usersService.createPersonal(personalDto);
  }
}
