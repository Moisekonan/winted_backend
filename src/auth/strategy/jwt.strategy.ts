import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { IResponseUser } from 'src/common/dao/response';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: configService.get<string>('secret'),
    });
  }
  async validate(payload: TokenPayload, request: Request): Promise<IResponseUser> {
    const { content: user } = await this.userService.findById(payload.userId);
    user.password = undefined;
    request.user = user;
    return {content: user, success: true};
  }
}
