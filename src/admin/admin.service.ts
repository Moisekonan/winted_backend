import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/users/entities/user-address.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { IResponse } from './dto/response.dto';
import { UpdateUserInputDto } from 'src/users/dtos/edit-account.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(Address)
    private readonly addresses: Repository<Address>,
  ) {}

  async findById(id: number): Promise<IResponse<User>> {
    try {
      const user = await this.users.findOne({ where: { id: id } });
      return { data: user, success: true };
    } catch (error) {
      return { success: false, error: "Couldn't find user" };
    }
  }

  async getAllUsers(): Promise<IResponse<User>> {
    const data = await this.users.find();
    if (!data) {
      return { success: false, total: data.length, error: 'No users found' };
    }
    return { success: true, total: data.length, data: data };
  }

  async getAllAddresses(): Promise<IResponse<Address>> {
    const data = await this.addresses.find();
    if (!data) {
      return {
        success: false,
        total: data.length,
        error: 'No addresses found',
      };
    }
    return { success: true, total: data.length, data: data };
  }

  async deleteUser(id: number): Promise<IResponse<User>> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    await this.users.delete(id);
    return { success: true, data: user };
  }

  async updateUser(
    id: number,
    dataToUpdate: UpdateUserInputDto,
  ): Promise<IResponse<User>> {
    try {
      const user = await this.users.findOne({ where: { id } });
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      await this.users.update(id, dataToUpdate);
      const userUpdate = await this.users.findOne({ where: { id } });
      return { success: true, data: userUpdate };
    } catch (error) {
      return { success: false, error: "Couldn't update user" };
    }
  }
}
