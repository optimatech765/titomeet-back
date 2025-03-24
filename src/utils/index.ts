import { HttpException, HttpStatus } from '@nestjs/common';

export const throwServerError = (error: any) => {
  if (error instanceof HttpException) {
    throw new HttpException(error.message, error.getStatus());
  }
  throw new HttpException(
    'Something went wrong',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
