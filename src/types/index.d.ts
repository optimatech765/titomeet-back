import { User } from '@optimatech88/titomeet-shared-lib';
import { Request } from '@nestjs/common';

export interface IRequest extends Request {
  user: User;
}