import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { SubCategory } from '../category/entities/sub-category.entity';
import { ProductImage } from './entities/product-image.entity';
import { AwsService } from 'src/common/services/aws/aws.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory, Product, ProductImage])],
  providers: [ProductService, AwsService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductsModule {}
