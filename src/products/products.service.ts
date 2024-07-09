import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductOutputDto } from './dtos/output.dto';
import { CreateProductInputDto } from './dtos/create-product.dto';
import {
  UpdateProductInputDto,
  UpdateVisibleProductInputDto,
} from './dtos/edit-product.dto';
import { SubCategory } from '../category/entities/sub-category.entity';
import { ProductImage } from './entities/product-image.entity';
import { CoreOutput } from 'src/common/dao/output.dto';
import { z } from 'zod';
import { AwsService, fileSchema } from 'src/common/services/aws/aws.service';
import { PagenationOption } from './interfaces/pagenationOption';

@Injectable()
export class ProductService {
  constructor(
    private readonly awsService: AwsService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
  ) {}

  async createProduct(
    sellerId: number,
    productInput: CreateProductInputDto,
    files?: z.infer<typeof fileSchema>[],
  ): Promise<ProductOutputDto> {
    try {
      const {
        name,
        subTitle,
        description,
        price,
        quantity,
        subCategory,
        shippingFee,
        brand,
        discount,
      } = productInput;

      const subCategoryExists = await this.subCategoryRepository.findOne({
        where: { name: subCategory },
        relations: ['category'],
      });

      console.log(subCategoryExists.category);

      if (!subCategoryExists) {
        return { success: false, message: 'Category does not exist.' };
      }

      Number(price);
      Number(quantity);
      Number(discount);
      if (isNaN(price) || isNaN(quantity) || isNaN(discount)) {
        return {
          success: false,
          message: 'Price,quantity and discount must be numbers.',
        };
      }
      const slug = await this.generateSlug(name, subCategoryExists);
      const newProduct = this.productRepository.create({
        name,
        subTitle,
        description,
        price,
        quantity,
        subCategory: subCategoryExists,
        slug: slug.toLowerCase(),
        sellerID: sellerId,
        seller: { id: sellerId },
        shippingFee,
        brand,
        discount,
      });

      // Upload images to S3
      const dataFileKey: string[] = await Promise.all(
        files.map(async (file) => {
          const fileKey: string = await this.awsService.uploadFile({ file });
          return fileKey;
        }),
      );

      const savedProduct = await this.productRepository.save(newProduct);
      await this.saveProductImages(savedProduct, dataFileKey);

      return { success: true, content: savedProduct };
    } catch (error) {
      console.log(error);
      console.log(error.message);
      return {
        success: false,
        message: `Failed to create product ${error.message}.`,
        error: error.message,
      };
    }
  }

  async findAllProducts(params: PagenationOption): Promise<ProductOutputDto> {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .where('product.visibility = :visibility', { visibility: true })
        .orderBy('product.id', 'DESC')
        .offset(params.offset)
        .limit(params.limit)
        .getMany();

      for (const product of products) {
        const imageKeys = product.images.map((image) => image.imageUrl);
        const imageUrls = await this.awsService.getFiles(imageKeys);
        product.images = product.images.map((image, index) => ({
          ...image,
          imageUrl: imageUrls[index],
        }));
      }

      return { success: true, content: products, total: products.length };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async getProductsOfSeller(sellerId: number): Promise<ProductOutputDto> {
    const products = await this.productRepository.find({
      where: { sellerID: sellerId },
      relations: ['images'],
    });

    // Récupération des images de chaque produit du service AWS
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const imageKeys = product.images.map((image) => image.imageUrl);
        const imageUrls = await this.awsService.getFiles(imageKeys);
        product.images = product.images.map((image, index) => ({
          ...image,
          imageUrl: imageUrls[index],
        }));
      } else {
        product.images = [];
      }
    }

    return { success: true, content: products, total: products.length };
  }

  async findAllByCategory(
    categoryId: number,
    params: PagenationOption,
  ): Promise<ProductOutputDto> {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .innerJoinAndSelect('product.subCategory', 'subCategory')
        .innerJoin('subCategory.category', 'category')
        .where('category.id = :categoryId', { categoryId })
        .orderBy('product.id', 'DESC')
        .offset(params.offset)
        .limit(params.limit)
        .getMany();

      // Récupération des images de chaque produit du service AWS
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this.awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));
        } else {
          product.images = [];
        }
      }

      return { success: true, content: products };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async findAllBySubCategory(
    subCategoryId: number,
    params: PagenationOption,
  ): Promise<ProductOutputDto> {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .innerJoinAndSelect('product.subCategory', 'subCategory')
        .where('product.subCategoryId = :subCategoryId', { subCategoryId })
        .orderBy('product.id', 'DESC')
        .offset(params.offset)
        .limit(params.limit)
        .getMany();

      // Récupération des images de chaque produit du service AWS
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this.awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));
        } else {
          product.images = [];
        }
      }

      return { success: true, content: products };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async searchBySlug(params: string): Promise<ProductOutputDto> {
    console.log('jj', params);
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .where('product.slug LIKE :v', { v: `%${params.toLowerCase()}%` })
        // .where('product.slug like :v', { v: params })
        .orderBy('product.id', 'DESC')
        .getMany();

      // Récupération des images de chaque produit du service AWS
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          const imageKeys = product.images.map((image) => image.imageUrl);
          const imageUrls = await this.awsService.getFiles(imageKeys);
          product.images = product.images.map((image, index) => ({
            ...image,
            imageUrl: imageUrls[index],
          }));
        } else {
          product.images = [];
        }
      }

      return { success: true, content: products };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  // async searchBySlug(params: PagenationOption): Promise<ProductOutputDto> {
  //   try {
  //     const products = await this.productRepository
  //       .createQueryBuilder('product')
  //       .leftJoinAndSelect('product.images', 'images')
  //       .where('product.slug like :v', { v: `%${params.v.toLowerCase()}%` })
  //       .orderBy('product.id', 'DESC')
  //       .offset(params.offset)
  //       .limit(params.limit)
  //       .getMany();
  //
  //     return { success: true, content: products };
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       success: false,
  //       message: 'Unknown error has occurred.',
  //       error: error.message,
  //     };
  //   }
  // }

  async findOneByID(id: number): Promise<ProductOutputDto> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['subCategory', 'images', 'seller'],
      });
      if (!product) {
        return { success: false, message: 'Product not found.' };
      }

      // Récupération des images de chaque produit du service AWS
      if (product.images && product.images.length > 0) {
        const imageKeys = product.images.map((image) => image.imageUrl);
        const imageUrls = await this.awsService.getFiles(imageKeys);
        product.images = product.images.map((image, index) => ({
          ...image,
          imageUrl: imageUrls[index],
        }));
      } else {
        product.images = [];
      }

      return { success: true, item: product };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async updateVisibilityProduct(
    id: number,
    productInput: Partial<UpdateVisibleProductInputDto>,
  ): Promise<ProductOutputDto> {
    try {
      const { visibility } = productInput;
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        return { success: false, message: 'Product not found.' };
      }

      product.visibility = visibility;

      await this.productRepository.save(product);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update product.',
        error: error.message,
      };
    }
  }

  async updateProduct(
    id: number,
    productInput: Partial<UpdateProductInputDto>,
  ): Promise<ProductOutputDto> {
    try {
      const {
        name,
        subTitle,
        description,
        price,
        quantity,
        subCategory,
        shippingFee,
        brand,
        discount,
        visibility,
      } = productInput;
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        return { success: false, message: 'Product not found.' };
      }

      const subCategoryExists = await this.subCategoryRepository.findOne({
        where: { name: subCategory },
      });
      if (!subCategoryExists) {
        return { success: false, message: 'subCategory does not exist.' };
      }

      product.name = name;
      product.subTitle = subTitle;
      product.description = description;
      product.price = price;
      product.quantity = quantity;
      product.subCategory = subCategoryExists;
      product.shippingFee = shippingFee;
      product.brand = brand;
      product.discount = discount;
      product.visibility = visibility;

      product.isInStock = product.quantity > 0;

      const updatedProduct = await this.productRepository.save(product);
      return { success: true, content: updatedProduct };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update product.',
        error: error.message,
      };
    }
  }

  async increaseProductQuantity(
    productId: number,
    quantityToAdd: number,
  ): Promise<CoreOutput> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (quantityToAdd <= 0) {
        return { success: false, error: 'Invalid quantity to add.' };
      }

      product.quantity += quantityToAdd;
      product.isInStock = product.quantity > 0;

      await this.productRepository.save(product);

      return {
        success: true,
        message: 'Product quantity increased successfully.',
      };
    } catch (error) {
      return { success: false, error: 'Failed to increase product quantity.' };
    }
  }

  async decreaseProductQuantity(
    productId: number,
    quantityToSubtract: number,
  ): Promise<CoreOutput> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (product.quantity < quantityToSubtract) {
        return { success: false, error: 'Insufficient product quantity.' };
      }

      product.quantity -= quantityToSubtract;
      product.isInStock = product.quantity > 0;

      await this.productRepository.save(product);

      return {
        success: true,
        message: 'Product quantity decreased successfully.',
      };
    } catch (error) {
      return { success: false, error: 'Failed to decrease product quantity.' };
    }
  }

  async deleteProduct(id: number): Promise<ProductOutputDto> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        return { success: false, message: 'Product not found.' };
      }

      await this.productRepository.softRemove(product);
      return { success: true, message: 'Product deleted successfully.' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete product.',
        error: error.message,
      };
    }
  }

  private async generateSlug(name: string, subCategory: SubCategory) {
    if (name && subCategory) {
      const slugSource = `${name} ${subCategory.name}`;
      console.log(slugSource);
      return slugSource;
    }
    return 'lamie';
  }

  private async saveProductImages(
    product: Product,
    imageUrls: string[],
  ): Promise<void> {
    const productImages = imageUrls.map((imageUrl) => {
      const productImage = new ProductImage();
      productImage.imageUrl = imageUrl;
      productImage.product = product;
      return productImage;
    });

    await this.productImageRepository.save(productImages);
  }
}
