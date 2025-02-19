import { User } from '@tenbou/test-shared-lib';
import { Request } from '@nestjs/common';

export interface IRequest extends Request {
  user: User;
}
