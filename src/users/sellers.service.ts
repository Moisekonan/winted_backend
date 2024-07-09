import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserInputDto } from './dtos/edit-account.dto';
import { hashPassword } from 'src/utils/hash-password';
import { CoreOutput } from 'src/common/dao/output.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { IResponseUser } from 'src/common/dao/response';
import { AwsService } from 'src/common/services/aws/aws.service';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly awsService: AwsService,
  ) {}

  // Seller

  async findSellers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.SELLER },
      relations: ['carts', 'address', 'orders', 'products'],
    });
  }

  async findSeller(userId: number): Promise<User> {
    const seller = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.SELLER },
      relations: [
        'carts',
        'address',
        'orders',
        'products',
        'products.images',
        'products.subCategory',
      ],
    });

    // extrait les produits du vendeur
    console.log(seller.products);

    // recuperation des images de chaque produit du service aws
    for (const product of seller.products) {
      const imageKeys = product.images.map((image) => image.imageUrl);
      const imageUrls = await this.awsService.getFiles(imageKeys);
      product.images = product.images.map((image, index) => ({
        ...image,
        imageUrl: imageUrls[index],
      }));
    }
    console.log(seller.products);

    return seller;
  }

  async findSellerById(id: number): Promise<IResponseUser> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id, role: UserRole.SELLER },
        relations: ['carts', 'address', 'orders', 'products'],
      });
      return { item: user, success: true };
    } catch (error) {
      return { success: false, error: "Couldn't find user" };
    }
  }

  async updateSeller(
    sellerId: number,
    updateUserDto: UpdateUserInputDto,
  ): Promise<IResponseUser> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: sellerId, role: UserRole.SELLER },
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

  async deleteSeller(userId: number): Promise<CoreOutput> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, role: UserRole.SELLER },
      });
      await this.userRepository.softRemove(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Couldn't delete user" };
    }
  }
}
