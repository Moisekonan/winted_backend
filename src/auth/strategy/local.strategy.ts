import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<number> {
    const response = await this.authService.getAuthenticatedUser(
      email,
      password,
    );
    if (response.success) {
      const userId = response.user.id;
      return userId;
    }
  }
}
