import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  })),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CartService', () => {
  let service: CartService;
  let cartRepository: MockRepository<Cart>;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(cartRepository).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('addCart', () => {
    const userId = 1;
    const productId = 1;
    const addCartInput = { userId, productId };
    const mockProduct = { id: productId, name: 'Test Product' };
    const mockCart = {
      id: 1,
      name: 'Test Product',
      quantity: 1,
      userId,
      productId,
    };

    it('should increase quantity if product already in cart', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart);
      cartRepository.save.mockResolvedValue({
        ...mockCart,
        quantity: mockCart.quantity + 1,
      });

      const result = await service.addCart(addCartInput);
      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { productId },
      });
      expect(cartRepository.save).toHaveBeenCalledWith({
        ...mockCart,
        quantity: ++mockCart.quantity,
      });
      expect(result).toEqual({ success: true });
    });

    it('should add new product to cart', async () => {
      cartRepository.findOne.mockResolvedValue(null);
      productRepository.findOneOrFail.mockResolvedValue(mockProduct);
      cartRepository.create.mockReturnValue(mockCart);
      cartRepository.save.mockResolvedValue(mockCart);

      const result = await service.addCart(addCartInput);
      expect(productRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(cartRepository.create).toHaveBeenCalledWith({
        name: mockProduct.name,
        productId: mockProduct.id,
        quantity: 1,
        userId: userId,
      });
      expect(cartRepository.save).toHaveBeenCalledWith(mockCart);
      expect(result).toEqual({ success: true });
    });

    it('should handle exceptions', async () => {
      cartRepository.findOne.mockRejectedValue(new Error());
      const result = await service.addCart(addCartInput);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('findCart', () => {
    const userId = 1;
    const carts = [{ id: 1, userId, productId: 1, quantity: 2 }];

    it('should return user carts', async () => {
      cartRepository.find.mockResolvedValue(carts);
      const result = await service.findCart(userId);
      expect(cartRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual({ success: true, carts });
    });

    it('should handle exceptions', async () => {
      cartRepository.find.mockRejectedValue(new Error());
      const result = await service.findCart(userId);
      expect(result).toEqual({ success: false, error: "Couldn't find cart" });
    });
  });

  describe('deleteCart', () => {
    const userId = 1;
    const cartId = 1;
    const cart = { id: cartId, userId };

    it('should fail if user not allowed', async () => {
      cartRepository.findOneOrFail.mockResolvedValue({ ...cart, userId: 2 });
      const result = await service.deleteCart(userId, cartId);
      expect(result).toEqual({ success: false, error: 'Not allowed.' });
    });

    it('should delete cart item', async () => {
      cartRepository.findOneOrFail.mockResolvedValue(cart);
      const result = await service.deleteCart(userId, cartId);
      expect(cartRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle exceptions', async () => {
      cartRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.deleteCart(userId, cartId);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });
  describe('updateCart', () => {
    const cartId = 1;
    const quantity = 2;
    const cart = { id: cartId, quantity: 1 };

    it('should update cart quantity', async () => {
      cartRepository.findOneOrFail.mockResolvedValue(cart);
      cartRepository.save.mockResolvedValue({ ...cart, quantity });
      const result = await service.updateCart(cartId, quantity);
      expect(cartRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: cartId },
      });
      expect(cartRepository.save).toHaveBeenCalledWith({ ...cart, quantity });
      expect(result).toEqual({ success: true });
    });

    it('should handle exceptions', async () => {
      cartRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.updateCart(cartId, quantity);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });
});
