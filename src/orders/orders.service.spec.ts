import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderItems, OrderDetails } from './entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOneOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrdersService', () => {
  let service: OrdersService;
  let orderItemsRepository: MockRepository<OrderItems>;
  let orderDetailsRepository: MockRepository<OrderDetails>;
  let paymentsRepository: MockRepository<Payment>;
  let productsRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(OrderItems),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderDetails),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderItemsRepository = module.get(getRepositoryToken(OrderItems));
    orderDetailsRepository = module.get(getRepositoryToken(OrderDetails));
    paymentsRepository = module.get(getRepositoryToken(Payment));
    productsRepository = module.get(getRepositoryToken(Product));
  });

  const setupMockQueryBuilder = ({
    getManyReturnValue,
    whereCondition = false,
  }) => {
    const queryBuilderMock = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(getManyReturnValue),
    };

    if (whereCondition) {
      queryBuilderMock.where = jest.fn().mockReturnThis();
    }

    orderItemsRepository.createQueryBuilder.mockReturnValueOnce(
      queryBuilderMock,
    );
  };

  describe('createOrder', () => {
    const userId = 1;
    const createOrderInput = { quantity: 2, productId: 1 };
    const mockPayment = { id: 1, userId };
    const mockProduct = { id: 1, price: 100 };
    const mockOrderDetail = { id: 1, price: 200, paymentId: 1, userId };
    const mockOrderItem = { quantity: 2, orderId: 1, productId: 1 };
    it('should successfully create an order', async () => {
      paymentsRepository.findOneOrFail.mockResolvedValue(mockPayment);
      productsRepository.findOneOrFail.mockResolvedValue(mockProduct);
      orderDetailsRepository.create.mockReturnValue(mockOrderDetail);
      orderItemsRepository.create.mockReturnValue(mockOrderItem);
      const result = await service.createOrder(userId, createOrderInput);
      expect(paymentsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(productsRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: createOrderInput.productId },
      });
      expect(orderDetailsRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(orderItemsRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(result).toEqual({ success: true });
    });

    it('should fail if an error occurs', async () => {
      paymentsRepository.findOneOrFail.mockRejectedValue(
        new Error("Couldn't find payment"),
      );
      const result = await service.createOrder(userId, createOrderInput);
      expect(result).toEqual({
        success: false,
        error: "Couldn't create an order.",
      });
    });
  });

  describe('listOrderByUser', () => {
    const userId = 1;
    const mockOrders = [{ id: 1, quantity: 2, orderId: 1, productId: 1 }];

    it('should return a list of orders for a user', async () => {
      setupMockQueryBuilder({
        whereCondition: true,
        getManyReturnValue: mockOrders,
      });

      const result = await service.listOrderByUser(userId);
      expect(result).toEqual({ success: true, orders: mockOrders });
    });

    it('should fail if an error occurs', async () => {
      setupMockQueryBuilder({
        getManyReturnValue: Promise.reject(new Error()),
        whereCondition: true,
      });
      const result = await service.listOrderByUser(userId);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });
});
