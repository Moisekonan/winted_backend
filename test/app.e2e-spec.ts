import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Address } from 'src/users/entities/user-address.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const USER_ENDPOINT = '/users';
const AUTH_ENDPOINT = '/auth';
const PRODUCT_ENDPOINT = '/product';
const CART_ENDPOINT = '/cart';
const PAYMENT_ENDPOINT = '/payment';
const ORDER_ENDPOINT = '/orders';

describe('app (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let userAddressRepository: Repository<Address>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userAddressRepository = module.get<Repository<Address>>(
      getRepositoryToken(Address),
    );
    await app.init();
  });

  afterAll(async () => {
    const dataSource: DataSource = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const connection: DataSource = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  describe('User', () => {
    it.todo('signup');
    it.todo('Get user');
    it.todo('Update user');
    it.todo('Add address');
    it.todo('Get address');
    it.todo('Update address');
    it.todo('Delete address');
  });

  describe('Auth', () => {
    it.todo('sign-in');
    it.todo('log-out');
  });

  describe('Product', () => {
    it.todo('Get product');
    it.todo('Get product by category');
    it.todo('Search product');
  });

  describe('Cart', () => {
    it.todo('Add cart');
    it.todo('Get cart');
    it.todo('Update cart');
    it.todo('Delete cart');
  });

  describe('Payment', () => {
    it.todo('Create payment');
    it.todo('Get payment');
    it.todo('Get payments');
    it.todo('Delete payment');
  });

  describe('Order', () => {
    it.todo('Create order');
    it.todo('List orders');
  });
});
