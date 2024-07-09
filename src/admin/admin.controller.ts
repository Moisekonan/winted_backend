import { Body, Controller, Get, Param, ParseIntPipe, Patch, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserInputDto } from 'src/users/dtos/edit-account.dto';
import { ApiTags } from '@nestjs/swagger';
@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dataToUpdate: UpdateUserInputDto) {
    return this.adminService.updateUser(id, dataToUpdate)
  }
}
