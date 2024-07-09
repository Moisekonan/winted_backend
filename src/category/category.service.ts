import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubCategoryDto } from './dtos/create-subcategory.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryOutputDto, SubCategoryOutputDto } from './dtos/output.dto';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { AwsService, fileSchema } from 'src/common/services/aws/aws.service';
import { z } from 'zod';

@Injectable()
export class CategoryService {
  constructor(
    private readonly awsService: AwsService,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private subCategoryRepository: Repository<SubCategory>,
  ) {}

  // Category
  async createCategory(
    categoryDto: CreateCategoryDto,
    image: z.infer<typeof fileSchema>,
  ): Promise<CategoryOutputDto> {
    try {
      const { name } = categoryDto;
      const categoryExists = await this.categoryRepository.findOne({
        where: { name: name },
      });

      if (categoryExists) {
        return { success: false, error: 'Category already exists.' };
      }

      // Upload images to S3
      const imageKey = await this.awsService.uploadFile({ file: image });

      const newCategory = this.categoryRepository.create({
        name,
        image: imageKey,
      });
      const savedCategory = await this.categoryRepository.save(newCategory);

      return { success: true, content: savedCategory };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create category.',
        error: error.message,
      };
    }
  }

  async findAllCategories(): Promise<CategoryOutputDto> {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['subCategories'],
      });

      for (const category of categories) {
        if (category.image) {
          const imageUrl = await this.awsService.getFile(category.image); // Récupère l'URL de l'image depuis AWS
          category.image = imageUrl;
        }
      }

      return { success: true, content: categories };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async findOneCategoryByID(id: number): Promise<CategoryOutputDto> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return { success: false, message: 'Category not found.' };
      }

      if (category.image) {
        const imageUrl = await this.awsService.getFile(category.image); // Récupère l'URL de l'image depuis AWS
        category.image = imageUrl;
      }

      return { success: true, content: category };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async updateCategory(
    id: number,
    categoryDto: CreateCategoryDto,
  ): Promise<CategoryOutputDto> {
    try {
      // const { name, image } = categoryDto;
      const { name } = categoryDto;
      const category = await this.categoryRepository.findOne({ where: { id } });

      if (!category) {
        return { success: false, message: 'Category not found.' };
      }

      category.name = name;
      // category.image = image;

      const updatedCategory = await this.categoryRepository.save(category);
      return { success: true, content: updatedCategory };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update category.',
        error: error.message,
      };
    }
  }

  async deleteCategory(id: number): Promise<CategoryOutputDto> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });

      if (!category) {
        return { success: false, message: 'Category not found.' };
      }

      await this.categoryRepository.softRemove(category);
      return { success: true, message: 'Category deleted successfully.' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete category.',
        error: error.message,
      };
    }
  }

  // SubCategory
  async createSubCategory(
    subCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryOutputDto> {
    try {
      console.log(subCategoryDto);
      const { name, categoryId } = subCategoryDto;

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found.');
      }

      const subCategoryExists = await this.subCategoryRepository.findOne({
        where: { name: name, category: category },
      });

      if (subCategoryExists) {
        return {
          success: false,
          error: 'SubCategory already exists in this category.',
        };
      }

      const newSubCategory = this.subCategoryRepository.create({
        name,
        category,
      });
      const savedSubCategory =
        await this.subCategoryRepository.save(newSubCategory);

      return { success: true, content: savedSubCategory };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create subcategory.',
        error: error.message,
      };
    }
  }

  async findAllSubCategories(): Promise<SubCategoryOutputDto> {
    console.log('here1');
    try {
      console.log('here');
      const subCategories = await this.subCategoryRepository.find({
        relations: ['category'],
      });
      return { success: true, content: subCategories };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async findOneSubCategoryByID(id: number): Promise<SubCategoryOutputDto> {
    try {
      const subCategory = await this.subCategoryRepository.findOne({
        where: { id },
        relations: ['category'],
      });
      if (!subCategory) {
        return { success: false, message: 'SubCategory not found.' };
      }

      return { success: true, content: subCategory };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }

  async updateSubCategory(
    id: number,
    subCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryOutputDto> {
    try {
      const { name, categoryId } = subCategoryDto;
      const subCategory = await this.subCategoryRepository.findOne({
        where: { id },
      });

      if (!subCategory) {
        return { success: false, message: 'SubCategory not found.' };
      }

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        return { success: false, message: 'Category not found.' };
      }

      subCategory.name = name;
      subCategory.category = category;

      const updatedSubCategory =
        await this.subCategoryRepository.save(subCategory);
      return { success: true, content: updatedSubCategory };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update subcategory.',
        error: error.message,
      };
    }
  }

  async deleteSubCategory(id: number): Promise<SubCategoryOutputDto> {
    try {
      const subCategory = await this.subCategoryRepository.findOne({
        where: { id },
      });

      if (!subCategory) {
        return { success: false, message: 'SubCategory not found.' };
      }

      await this.subCategoryRepository.remove(subCategory);
      return { success: true, message: 'SubCategory deleted successfully.' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete subcategory.',
        error: error.message,
      };
    }
  }

  async findAllSubCategoriesByCategoryID(
    id: number,
  ): Promise<SubCategoryOutputDto> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return { success: false, message: 'Category not found.' };
      }

      const subCategories = await this.subCategoryRepository.find({
        where: { category: !!category },
      });
      return { success: true, content: subCategories };
    } catch (error) {
      return {
        success: false,
        message: 'Unknown error has occurred.',
        error: error.message,
      };
    }
  }
}
