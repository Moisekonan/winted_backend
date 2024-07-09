import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/users/users.service';
import { UserOutputDto } from 'src/users/dtos/user.dto';
import { CoreOutput } from 'src/common/dao/output.dto';
import { comparePasswords } from 'src/utils/hash-password';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getAuthenticatedUser(
    email: string,
    plainTextPassword: string,
  ): Promise<UserOutputDto> {
    try {
      const { content: user } = await this.userService.findByEmail(email); // 'data: user' au lieu de { user } car on a un objet de retour de type UserOutputDto
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      const result = await comparePasswords(plainTextPassword, user.password);
      if (result.success) {
        user.password = undefined;
        return { success: true, user };
      }
      return { success: false, error: 'Invalid authentication information.' };
    } catch (error) {
      return { success: false, error: 'Unknown error has occurred.' };
    }
  }

   // Méthode pour récupérer l'utilisateur connecté
   getUserFromToken(request: Request): Promise<any> {
    const token = request.headers.authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      return Promise.resolve(decoded);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<CoreOutput> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (isPasswordMatching) {
      return { success: true };
    }
    return { success: false, error: 'Invalid authentication information.' };
  }

  public getCookieWithJwtToken(info: any) {
    const payload: TokenPayload = {
      userId: info.user.id,
      email: info.user.email,
      role: info.user.role,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=30m`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
