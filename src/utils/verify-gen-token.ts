import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Initialisation du service JWT
const jwtService = new JwtService();

// Fonction pour générer un token JWT
export const generateToken = (
  payload: object,
  configService: ConfigService,
): string => {
  const secret = configService.get<string>('JWT_SECRET');
  return jwtService.sign({ payload }, { secret, expiresIn: configService.get<string>('JWT_EXPIRATION_TIME')});
};

// Fonction pour vérifier un token JWT
export const verifyToken = (
  token: string,
  configService: ConfigService,
): string | object => {
  try {
    const secret = configService.get<string>('JWT_SECRET');
    return jwtService.verify(token, { secret });
  } catch {
    throw new Error('Invalid token');
  }
};