import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { UserOutputDto } from './dtos/user.dto';
import { UpdateUserInputDto } from './dtos/edit-account.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminPersonalSellerGuard } from 'src/common/guards/admin-personal.guard';
import { AdminGuard } from 'src/common/guards/admin-only.guard';
import { SellerService } from './sellers.service';
import { SellerGuard } from 'src/common/guards/seller-only.guard';

@Controller('sellers')
@ApiTags('seller')
export class SellerController {
  constructor(private readonly _sellersService: SellerService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiResponse({
    status: 200,
    description: 'All sellers',
    type: UserOutputDto,
  })
  async findSellers() {
    return this._sellersService.findSellers();
  }

  @UseGuards(JwtAuthGuard, SellerGuard)
  @Get('')
  @ApiOperation({ summary: 'Get seller details authenticated' })
  @ApiResponse({
    status: 200,
    description: 'Seller details',
    type: UserOutputDto,
  })
  async findSeller(@Req() { user }: RequestWithUser) {
    return this._sellersService.findSeller(user['userId']);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findSellerById(@Param('id', ParseIntPipe) id: number) {
    return this._sellersService.findSellerById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async updateSeller(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserInputDto,
  ) {
    return this._sellersService.updateSeller(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteSeller(@Param('id', ParseIntPipe) id: number) {
    return this._sellersService.deleteSeller(id);
  }
}
