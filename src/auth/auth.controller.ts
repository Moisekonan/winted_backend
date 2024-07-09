import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInputDto } from './dto/sign-in.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'It will give you the access_token in the response',
  })
  async signIn(
    @Body() createUserDto: SignInputDto,
    @Res() response: Response,
  ): Promise<Response> {
    const authenticatedUser = await this.authService.getAuthenticatedUser(
      createUserDto.email,
      createUserDto.password,
    );
  
    if (!authenticatedUser.success) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: authenticatedUser.error,
      });
    }
  
    const cookie = this.authService.getCookieWithJwtToken(authenticatedUser);
    response.setHeader('Set-Cookie', cookie);
  
    // Extraire la valeur du jeton du cookie
    const tokenValue = cookie.split('=')[1].split(';')[0];

    // Ajouter le token JWT dans les en-têtes de la réponse
    response.setHeader('Authorization', `Bearer ${tokenValue}`);
  
    // Récupérer le rôle de l'utilisateur depuis l'utilisateur authentifié
    const { ...user } = authenticatedUser.user;
  
    return response.status(HttpStatus.OK).json({
      success: true,
      token: tokenValue,
      user: user,
      status: HttpStatus.OK,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('log-out')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'It will log out the user and invalidate the access token',
  })
  async logOut(@Res() response: Response): Promise<Response> {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.status(HttpStatus.OK).json({
      success: true,
      status: HttpStatus.OK,
    });
  }
}
