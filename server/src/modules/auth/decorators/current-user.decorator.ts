import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from 'src/modules/users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: ActiveUserData = request.user;

    return data ? user?.[data] : user;
  },
);
