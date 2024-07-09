import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductOutputDto } from './dtos/output.dto';
import { ProductService } from './products.service';
import { CreateProductInputDto } from './dtos/create-product.dto';
import {
  UpdateProductInputDto,
  UpdateVisibleProductInputDto,
} from './dtos/edit-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminPersonalSellerGuard } from 'src/common/guards/admin-personal.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileSchema } from 'src/common/services/aws/aws.service';
import { AdminGuard } from 'src/common/guards/admin-only.guard';
import { SellerGuard } from 'src/common/guards/seller-only.guard';
import { PagenationOption } from './interfaces/pagenationOption';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // PRODUCT

  @Get('')
  @ApiOperation({ summary: 'Get all products' })
  async getProduct(
    @Query() params: PagenationOption,
  ): Promise<ProductOutputDto> {
    return this.productService.findAllProducts(params);
  }

  @Get('/v')
  @ApiOperation({ summary: 'Search Product By Name' })
  async searchProduct(
    @Query('nameOrSlug') params: string,
  ): Promise<ProductOutputDto> {
    console.log('arrive', params);
    return this.productService.searchBySlug(params);
  }

  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getProductsOfSeller(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ): Promise<ProductOutputDto> {
    return this.productService.getProductsOfSeller(sellerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get products By Id' })
  async getProductByID(
    @Param('id', ParseIntPipe) productID: number,
  ): Promise<ProductOutputDto> {
    return this.productService.findOneByID(productID);
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get products By Category' })
  async getProductByCategory(
    @Query() params: PagenationOption,
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ProductOutputDto> {
    return this.productService.findAllByCategory(categoryId, params);
  }

  @Get('subCategory/:id')
  @ApiOperation({ summary: 'Get products By SubCategory' })
  async getProductBySubCategory(
    @Query() params: PagenationOption,
    @Param('id', ParseIntPipe) subcategoryID: number,
  ): Promise<ProductOutputDto> {
    return this.productService.findAllBySubCategory(subcategoryID, params);
  }

  @Post('')
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(JwtAuthGuard, SellerGuard)
  @ApiOperation({ summary: 'Create Product' })
  async createProduct(
    @Req() { user }: RequestWithUser,
    @UploadedFiles() images,
    @Body() productInput: CreateProductInputDto,
  ) {
    console.log(images);
    const imagesFiles = images.map((file) => {
      return fileSchema.parse({
        size: file.size,
        originalname: file.originalname,
        buffer: file.buffer,
        mineType: file.mimetype,
      });
    });

    return this.productService.createProduct(
      user['userId'],
      productInput,
      imagesFiles,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  @ApiOperation({ summary: 'Update Product' })
  async updateProduct(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) productID: number,
    @Body() productInput: UpdateProductInputDto,
  ): Promise<ProductOutputDto> {
    return this.productService.updateProduct(productID, productInput);
  }

  @Put('vi/:id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  @ApiOperation({ summary: 'Update Visibility Product' })
  async updateVisibleProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() productInput: UpdateVisibleProductInputDto,
  ): Promise<ProductOutputDto> {
    return this.productService.updateVisibilityProduct(id, productInput);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  @ApiOperation({ summary: 'Delete Product' })
  async deleteProduct(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) productID: number,
  ): Promise<ProductOutputDto> {
    return this.productService.deleteProduct(productID);
  }
}
