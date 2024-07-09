import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from 'src/utils/verify-gen-token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token: string;

    // Vérifier si le token est présent dans les cookies
    if (request.cookies && request.cookies.Authentication) {
      token = request.cookies.Authentication;
    }

    // Vérifier si le token est présent dans l'en-tête d'autorisation
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      const [bearer, tokenValue] = authHeader.split(' ');

      if (bearer === 'Bearer' && tokenValue) {
        token = tokenValue;
      }
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = verifyToken(token, this.configService);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  // Méthode pour récupérer l'utilisateur connecté
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
