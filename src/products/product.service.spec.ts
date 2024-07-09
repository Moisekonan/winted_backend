import { Test } from '@nestjs/testing';
import { ProductService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { SubCategory } from 'src/category/entities/sub-category.entity';

const mockRepository = () => ({
  createQueryBuilder: jest.fn(),
});

const mockProduct = (id: number) => {
  const subCategory = new SubCategory();
  subCategory.id = 1;
  subCategory.name = 'Example SubCategory';

  return {
    id,
    name: `Product ${id}`,
    description: `Description for Product ${id}`,
    price: 100 + id,
    quantity: 20 + id,
    subCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductService', () => {
  let service: ProductService;
  let productsRepository: MockRepository<Product>;

  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = modules.get<ProductService>(ProductService);
    productsRepository = modules.get(getRepositoryToken(Product));
  });

  const setupMockQueryBuilder = ({
    getManyReturnValue,
    whereCondition = false,
  }) => {
    const queryBuilderMock = {
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(getManyReturnValue),
    };

    if (whereCondition) {
      queryBuilderMock.where = jest.fn().mockReturnThis();
    }

    productsRepository.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return products', async () => {
      const mockResult = [mockProduct(1), mockProduct(2)];
      setupMockQueryBuilder({ getManyReturnValue: mockResult });

      const params = { offset: 0, limit: 10 };
      const result = await service.findAllProducts(params);
      expect(result).toEqual({ success: true, products: mockResult });
    });

    it('should fail on exception', async () => {
      setupMockQueryBuilder({
        getManyReturnValue: Promise.reject(new Error()),
      });

      const params = { offset: 0, limit: 10 };
      await expect(service.findAllProducts(params)).resolves.toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('findAllByCategory', () => {
    it('should return products by category', async () => {
      const categoryId = 1;
      const params = { offset: 0, limit: 10 };
      const mockResult = [mockProduct(3)];
      setupMockQueryBuilder({
        getManyReturnValue: mockResult,
        whereCondition: true,
      });

      const result = await service.findAllByCategory(categoryId, params);
      expect(result).toEqual({ success: true, products: mockResult });
    });

    it('should fail on exception', async () => {
      setupMockQueryBuilder({
        getManyReturnValue: Promise.reject(new Error('Error occurred')),
        whereCondition: true,
      });

      const categoryId = 1;
      const params = { offset: 0, limit: 10 };
      await expect(
        service.findAllByCategory(categoryId, params),
      ).resolves.toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('searchByName', () => {
    it('should return products by search result', async () => {
      const params = { offset: 0, limit: 10, search: 'test' };
      const mockResult = [mockProduct(4)];
      setupMockQueryBuilder({
        getManyReturnValue: mockResult,
        whereCondition: true,
      });

      const result = await service.searchByName(params);
      expect(result).toEqual({ success: true, products: mockResult });
    });

    it('should fail on exception', async () => {
      setupMockQueryBuilder({
        getManyReturnValue: Promise.reject(new Error('Error occurred')),
        whereCondition: true,
      });

      const params = { offset: 0, limit: 10, search: 'test' };
      await expect(service.searchByName(params)).resolves.toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('searchBySlug', () => {
    it('should return products by slug', async () => {
      const params = { offset: 0, limit: 10, search: 'test-slug' };
      const mockResult = [mockProduct(5)];
      setupMockQueryBuilder({
        getManyReturnValue: mockResult,
        whereCondition: true,
      });

      const result = await service.searchBySlug(params);
      expect(result).toEqual({ success: true, products: mockResult });
    });

    it('should fail on exception', async () => {
      setupMockQueryBuilder({
        getManyReturnValue: Promise.reject(new Error('Error occurred')),
        whereCondition: true,
      });

      const params = { offset: 0, limit: 10, search: 'test-slug' };
      await expect(service.searchBySlug(params)).resolves.toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });
});






// import { Test } from '@nestjs/testing';
// import { ProductService } from './products.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Product } from './entities/product.entity';
// import { Repository } from 'typeorm';
// import { SubCategory } from 'src/category/entities/sub-category.entity';

// const mockRepository = () => ({
//   createQueryBuilder: jest.fn(),
// });

// const mockProduct = (id: number) => {
//   const category = new SubCategory();
//   category.id = 1;
//   category.name = 'Example Category';

//   return {
//     id,
//     name: `Product ${id}`,
//     description: `Description for Product ${id}`,
//     price: 100 + id,
//     quantity: 20 + id,
//     category,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     deletedAt: null,
//   };
// };

// type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// describe('ProductService', () => {
//   let service: ProductService;
//   let productsRepository: MockRepository<Product>;

//   beforeAll(async () => {
//     const modules = await Test.createTestingModule({
//       providers: [
//         ProductService,
//         {
//           provide: getRepositoryToken(Product),
//           useValue: mockRepository(),
//         },
//       ],
//     }).compile();
//     service = modules.get<ProductService>(ProductService);
//     productsRepository = modules.get(getRepositoryToken(Product));
//   });

//   const setupMockQueryBuilder = ({
//     getManyReturnValue,
//     whereCondition = false,
//   }) => {
//     const queryBuilderMock = {
//       orderBy: jest.fn().mockReturnThis(),
//       offset: jest.fn().mockReturnThis(),
//       limit: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       getMany: jest.fn().mockReturnValue(getManyReturnValue),
//     };

//     if (whereCondition) {
//       queryBuilderMock.where = jest.fn().mockReturnThis();
//     }

//     productsRepository.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);
//   };

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return products', async () => {
//       const mockResult = [mockProduct(1), mockProduct(2)];
//       setupMockQueryBuilder({ getManyReturnValue: mockResult });

//       const params = { offset: 0, limit: 10 };
//       const result = await service.findAll(params);
//       expect(result).toEqual({ success: true, products: mockResult });
//     });

//     it('should fail on exception', async () => {
//       setupMockQueryBuilder({
//         getManyReturnValue: Promise.reject(new Error()),
//       });

//       const params = { offset: 0, limit: 10 };
//       await expect(service.findAll(params)).resolves.toEqual({
//         success: false,
//         error: 'Unknown error has occurred.',
//       });
//     });
//   });

//   describe('findAllByCategory', () => {
//     it('should return products by category', async () => {
//       const categoryId = 1;
//       const params = { offset: 0, limit: 10 };
//       const mockResult = [mockProduct(3)];
//       setupMockQueryBuilder({
//         getManyReturnValue: mockResult,
//         whereCondition: true,
//       });

//       const result = await service.findAllByCategory(categoryId, params);
//       expect(result).toEqual({ success: true, products: mockResult });
//     });

//     it('should fail on exception', async () => {
//       setupMockQueryBuilder({
//         getManyReturnValue: Promise.reject(new Error('Error occurred')),
//         whereCondition: true,
//       });

//       const categoryId = 1;
//       const params = { offset: 0, limit: 10 };
//       await expect(
//         service.findAllByCategory(categoryId, params),
//       ).resolves.toEqual({
//         success: false,
//         error: 'Unknown error has occurred.',
//       });
//     });
//   });

//   describe('searchByName', () => {
//     it('should return products by search result', async () => {
//       const params = { offset: 0, limit: 10, search: 'test' };
//       const mockResult = [mockProduct(4)];
//       setupMockQueryBuilder({
//         getManyReturnValue: mockResult,
//         whereCondition: true,
//       });

//       const result = await service.searchByName(params);
//       expect(result).toEqual({ success: true, products: mockResult });
//     });

//     it('should fail on exception', async () => {
//       setupMockQueryBuilder({
//         getManyReturnValue: Promise.reject(new Error('Error occurred')),
//         whereCondition: true,
//       });

//       const params = { offset: 0, limit: 10, search: 'test' };
//       await expect(service.searchByName(params)).resolves.toEqual({
//         success: false,
//         error: 'Unknown error has occurred.',
//       });
//     });
//   });
// });
