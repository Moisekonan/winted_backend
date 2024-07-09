import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

type MockUserService = MockType<UserService>;

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('getAuthenticatedUser', () => {
    it('should return user data if credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      userService.findByEmail.mockResolvedValue({
        success: true,
        user: mockUser,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.getAuthenticatedUser(
        mockUser.email,
        'plainPassword',
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual({
        success: true,
        user: { ...mockUser, password: undefined },
      });
    });

    it('should return error if credentials are invalid', async () => {
      userService.findByEmail.mockResolvedValue({ success: true, user: {} });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.getAuthenticatedUser(
        'wrong@example.com',
        'wrongPassword',
      );
      expect(result).toEqual({
        success: false,
        error: 'Invalid authentication information.',
      });
    });

    it('should handle exceptions', async () => {
      userService.findByEmail.mockRejectedValue(new Error());
      const result = await service.getAuthenticatedUser(
        'error@example.com',
        'password',
      );
      expect(result).toEqual({
        success: false,
        error: 'Unknown error has occurred.',
      });
    });
  });

  describe('getCookieWithJwtToken', () => {
    it('should return a cookie with JWT token', () => {
      const userId = 1;
      const mockJwt = 'mockJwtToken';
      jwtService.sign.mockReturnValue(mockJwt);
      configService.get.mockReturnValue('3600');

      const result = service.getCookieWithJwtToken(userId);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId },
        expect.any(Object),
      );
      expect(result).toContain(`Authentication=${mockJwt}`);
    });
  });

  describe('getCookieForLogOut', () => {
    it('should return a cookie for logout', () => {
      const result = service.getCookieForLogOut();
      expect(result).toBe('Authentication=; HttpOnly; Path=/; Max-Age=0');
    });
  });
});
