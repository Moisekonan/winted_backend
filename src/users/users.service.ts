import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserInputDto } from './dtos/create-account.dto';
import { IUser, UserOutputDto } from './dtos/user.dto';
import { UpdateUserInputDto } from './dtos/edit-account.dto';
import { hashPassword } from 'src/utils/hash-password';
import { CreateAddressInputDto } from './dtos/create-address.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { Address } from './entities/user-address.entity';
import { AddressOutputDto } from './dtos/address.dto';
import { UpdateAddressInputDto } from './dtos/update-address.dto';
import { ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';
import { IResponseUser } from 'src/common/dao/response';
import { CreatePersonalInputDto } from './dtos/create-personal.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  // Register a user
  @ApiResponse({ status: 201, type: UserOutputDto })
  async signup({
    email,
    password,
    firstName,
    lastName,
    phone,
    addressLine1,
    addressLine2,
    country,
    city,
    role,
  }: CreateUserInputDto): Promise<CoreOutput> {
    try {
      const exists = await this.userRepository.findOne({ where: { email } });

      if (exists) {
        return { content: [], success: false, error: 'User already exists' };
      }

      password = await hashPassword(password);

      const user = this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        country,
        city,
        role,
      });
      await this.userRepository.save(user);

      return { content: user, success: true };
    } catch (error) {
      console.log(error);
      return { content: [], success: false, error: "Couldn't create account" };
    }
  }

  // User
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.USER },
    });
  }

  async findById(id: number): Promise<IResponseUser> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: ['carts', 'address', 'orders'],
      });
      return { content: { ...user, password: undefined }, success: true };
    } catch (error) {
      console.log('error', error);
      return { success: false, error: "Couldn't find user" };
    }
  }

  async findByEmail(email: string): Promise<IResponseUser> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['carts', 'address', 'orders'],
      });
      return { content: user, success: true };
    } catch (error) {
      return { success: false, error: "Couldn't find user" };
    }
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserInputDto,
  ): Promise<IResponseUser> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (updateUserDto.password) {
        updateUserDto.password = await hashPassword(updateUserDto.password);
      }

      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);

      return { content: user, success: true };
    } catch (error) {
      return { success: false, error: "Couldn't find user" };
    }
  }

  async deleteUser(userId: number): Promise<CoreOutput> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      await this.userRepository.remove(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Couldn't delete user" };
    }
  }

  // Address

  async addAddress(
    { addressLine1, addressLine2, city, country }: CreateAddressInputDto,
    userId: number,
  ): Promise<CoreOutput> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user.hasAddress) {
        return { success: false, error: 'Address exist.' };
      }

      const address = this.addressRepository.create({
        addressLine1,
        addressLine2,
        city,
        country,
        user,
      });
      user.hasAddress = true;
      await this.addressRepository.save(address);
      await this.userRepository.save(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Couldn't create address" };
    }
  }

  async readAddress(userId: number): Promise<AddressOutputDto> {
    try {
      const address = await this.addressRepository.findOne({
        where: { user: { id: userId } },
      } as FindOneOptions<Address>);
      return { success: true, content: address };
    } catch (error) {
      return { success: false, error: "Couldn't find address" };
    }
  }

  async deleteAddress(userId: number): Promise<CoreOutput> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user.hasAddress) {
        return { success: false, error: 'Address not exist' };
      }

      await this.addressRepository
        .createQueryBuilder()
        .delete()
        .from(Address)
        .where('userId = :id', { id: userId })
        .execute();

      user.hasAddress = false;
      await this.userRepository.save(user);

      return { success: true, content: user };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  async updateAddress(
    userId: number,
    updateAddressDto: UpdateAddressInputDto,
  ): Promise<CoreOutput> {
    try {
      const address = await this.addressRepository.findOne({
        where: { user: { id: userId } },
      } as FindOneOptions<Address>);
      Object.assign(address, updateAddressDto);
      await this.addressRepository.save(address);

      return { success: true, content: address };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

  // ADMIN
  async promoteToAdmin(userId: number): Promise<IUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.role = UserRole.ADMIN;
    return this.userRepository.save(user);
  }

  async demoteToUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.role = UserRole.USER;
    return this.userRepository.save(user);
  }

  async createPersonal({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  }: CreatePersonalInputDto) {
    try {
      const exists = await this.userRepository.findOne({ where: { email } });

      if (exists) {
        return { content: [], success: false, error: 'User already exists' };
      }

      password = await hashPassword(password);

      const user = this.userRepository.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
      });
      await this.userRepository.save(user);

      return { content: user, success: true };
    } catch (error) {
      return { content: [], success: false, error: "Couldn't create account" };
    }
  }
}
