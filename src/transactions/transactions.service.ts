import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  getPaginationData,
  PrismaService,
  User,
} from '@optimatech88/titomeet-shared-lib';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  UserInterestDtoPayload,
} from '../dto/users.dto';
import { throwServerError } from 'src/utils';
import { GetPricingsQueryDto } from 'src/dto/admin.dto';
import { SubscriptionPayloadDto } from 'src/dto/transaction.dto';
import { FedapayService } from 'src/fedapay/fedapay.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private prisma: PrismaService,
    private fedapayService: FedapayService,
  ) {}
  async getPricings(query: GetPricingsQueryDto) {
    try {
      const { skip, page, limit } = getPaginationData(query);
      const where = {} as any;

      if (query.search) {
        where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }];
      }

      if (query.type) {
        where.type = query.type;
      }

      const pricings = await this.prisma.pricing.findMany({
        where,
        skip,
        take: limit,
      });

      const total = await this.prisma.pricing.count({
        where,
      });

      return {
        items: pricings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      return throwServerError(error);
    }
  }

  async createSubscription(user: User, payload: SubscriptionPayloadDto) {
    try {
      const pricing = await this.prisma.pricing.findUnique({
        where: { id: payload.pricingId },
      });

      if (!pricing) {
        throw new HttpException('Pricing not found', HttpStatus.NOT_FOUND);
      }
      const txn = await this.fedapayService.createTransaction({
        amount: pricing.amount,
        description: `Abonnement #${pricing.title}`,
        callbackUrl: payload.callbackUrl,
        customer: {
          email: user.email,
          firstname: user.firstName,
          lastname: user.lastName,
        },
        user,
        pricingId: pricing.id,
      });

      const paymentLink =
        await this.fedapayService.createTransactionPaymentLink(txn.id);
      return paymentLink;
    } catch (error) {
      return throwServerError(error);
    }
  }
}
