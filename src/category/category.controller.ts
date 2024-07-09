import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductOutputDto } from 'src/products/dtos/output.dto';
import { CreateCategoryDto } from '../category/dtos/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubCategoryDto } from './dtos/create-subcategory.dto';
import { CategoryService } from './category.service';
import { UpdateSubCategoryDto } from './dtos/edit-subcategory.dto';
import { SubCategoryOutputDto } from './dtos/output.dto';
import { AdminPersonalSellerGuard } from 'src/common/guards/admin-personal.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileSchema } from 'src/common/services/aws/aws.service';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // CATEGORY
  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async createCategory(
    @UploadedFile() image,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    if (image) {
      const parsedImage = fileSchema.parse({
        size: image.size,
        originalname: image.originalname,
        buffer: image.buffer,
        mineType: image.mimetype,
      });

      return this.categoryService.createCategory(
        createCategoryDto,
        parsedImage,
      );
    } else {
      return {
        success: false,
        message: 'Image is required.',
      };
    }
  }

  @Get('')
  async getCategory(): Promise<ProductOutputDto> {
    return this.categoryService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  @Post('subcategory')
  async createSubCategory(
    @Req() req: RequestWithUser,
    @Body() subCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryOutputDto> {
    const { categoryId, name } = subCategoryDto;
    const category = await this.categoryService.findOneCategoryByID(categoryId);
    console.log(category);
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    console.log(categoryId, name);
    console.log(subCategoryDto);
    return this.categoryService.createSubCategory({ categoryId, name });
  }

  @Get('subcategory/:id')
  async getSubCategoryByID(
    @Param('id', ParseIntPipe) subCategoryId: number,
  ): Promise<SubCategoryOutputDto> {
    console.log('getSubCategoryByID');
    return this.categoryService.findOneSubCategoryByID(subCategoryId);
  }

  @Get('subcategory')
  async getSubCategory(): Promise<SubCategoryOutputDto> {
    console.log('getSubCategory');
    return await this.categoryService.findAllSubCategories();
  }

  @Put('subcategory/:id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async updateSubCategory(
    @Req() req: RequestWithUser,
    @Param('id') subCategoryId: number,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryOutputDto> {
    return this.categoryService.updateSubCategory(
      subCategoryId,
      updateSubCategoryDto,
    );
  }

  @Delete('subcategory/:id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async deleteSubCategory(
    @Req() req: RequestWithUser,
    @Param('id') subCategoryId: number,
  ): Promise<SubCategoryOutputDto> {
    return this.categoryService.deleteSubCategory(subCategoryId);
  }

  @Get(':id')
  async getCategoryByID(
    @Param('id') categoryID: number,
  ): Promise<ProductOutputDto> {
    return this.categoryService.findOneCategoryByID(categoryID);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async updateCategory(
    @Req() req: RequestWithUser,
    @Param('id') categoryID: number,
    @Body() name: CreateCategoryDto,
  ): Promise<ProductOutputDto> {
    return this.categoryService.updateCategory(categoryID, name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminPersonalSellerGuard)
  async deleteCategory(
    @Req() req: RequestWithUser,
    @Param('id') categoryID: number,
  ): Promise<ProductOutputDto> {
    return this.categoryService.deleteCategory(categoryID);
  }

  // SUBCATEGORY
}
