import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentService } from './payments.service';

const mockPaymentRepository = () => ({
  findOne: jest.fn(),
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

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: MockRepository<Payment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository(),
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get(getRepositoryToken(Payment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(paymentRepository).toBeDefined();
  });

  describe('createUserPayment', () => {
    const userId = 1;
    const createPaymentInput = {
      paymentType: 'Credit Card',
      accountNumber: '123456789',
      expire: '02-21',
    };

    it('should fail if payment method already exists', async () => {
      paymentRepository.findOne.mockResolvedValue(createPaymentInput);
      const result = await service.createUserPayment(
        userId,
        createPaymentInput,
      );
      expect(result).toEqual({
        success: false,
        error: 'Payment method already exists',
      });
    });

    it('should create a new payment method', async () => {
      paymentRepository.findOne.mockResolvedValue(undefined);
      paymentRepository.create.mockReturnValue(createPaymentInput);
      paymentRepository.save.mockResolvedValue(createPaymentInput);

      const result = await service.createUserPayment(
        userId,
        createPaymentInput,
      );
      expect(paymentRepository.create).toHaveBeenCalledWith({
        ...createPaymentInput,
        userId,
      });
      expect(paymentRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle exceptions', async () => {
      paymentRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createUserPayment(
        userId,
        createPaymentInput,
      );
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('deleteUserPayment', () => {
    const userId = 1;
    const paymentId = 1;
    const payment = { id: paymentId, userId };

    it('should fail if payment method does not exist', async () => {
      paymentRepository.findOne.mockResolvedValue(undefined);
      const result = await service.deleteUserPayment(userId, paymentId);
      expect(result).toEqual({
        success: false,
        error: 'Payment method not exists',
      });
    });

    it('should fail if payment method belongs to another user', async () => {
      paymentRepository.findOne.mockResolvedValue({ ...payment, userId: 2 });
      const result = await service.deleteUserPayment(userId, paymentId);
      expect(result).toEqual({ success: false, error: 'Not your wallet.' });
    });

    it('should delete the payment method', async () => {
      paymentRepository.findOne.mockResolvedValue(payment);
      const result = await service.deleteUserPayment(userId, paymentId);
      expect(paymentRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle exceptions', async () => {
      paymentRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deleteUserPayment(userId, paymentId);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('getUserPayment', () => {
    const userId = 1;
    const paymentId = 1;
    const payment = { id: paymentId, userId };

    it('should fail if payment method does not exist', async () => {
      paymentRepository.findOne.mockResolvedValue(undefined);
      const result = await service.getUserPayment(userId, paymentId);
      expect(result).toEqual({
        success: false,
        error: 'Payment method not exists.',
      });
    });

    it('should fail if payment method belongs to another user', async () => {
      paymentRepository.findOne.mockResolvedValue({ ...payment, userId: 2 });
      const result = await service.getUserPayment(userId, paymentId);
      expect(result).toEqual({ success: false, error: 'Not your wallet.' });
    });

    it('should return the payment method', async () => {
      paymentRepository.findOne.mockResolvedValue(payment);
      const result = await service.getUserPayment(userId, paymentId);
      expect(result).toEqual({ success: true, payment });
    });

    it('should handle exceptions', async () => {
      paymentRepository.findOne.mockRejectedValue(new Error());
      const result = await service.getUserPayment(userId, paymentId);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('getUserPayments', () => {
    const userId = 1;
    const payments = [
      { id: 1, userId },
      { id: 2, userId },
    ];

    it('should return user payments', async () => {
      paymentRepository.find.mockResolvedValue(payments);
      const result = await service.getUserPayments(userId);
      expect(result).toEqual({ success: true, payment: payments });
    });

    it('should handle exceptions', async () => {
      paymentRepository.find.mockRejectedValue(new Error());
      const result = await service.getUserPayments(userId);
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });
});
