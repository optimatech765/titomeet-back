import { HttpException, HttpStatus } from '@nestjs/common';
import { PricingDuration } from '@optimatech88/titomeet-shared-lib';

export const throwServerError = (error: any) => {
  if (error instanceof HttpException) {
    throw new HttpException(error.message, error.getStatus());
  }
  throw new HttpException(
    'Something went wrong',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

export const getExpiresAt = (duration: PricingDuration): Date => {
  switch (duration) {
    case PricingDuration.WEEKLY:
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    case PricingDuration.BI_WEEKLY:
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    case PricingDuration.MONTHLY:
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    case PricingDuration.YEARLY:
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }
};
