import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class SellerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user || !request.user.role) {
      console.log('No user or role found');
      return false;
    }
    const userRole = request.user.role;
    return (
      userRole === UserRole.SELLER
    );
  }
}
