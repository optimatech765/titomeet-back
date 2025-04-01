import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  PrismaService,
} from '@optimatech88/titomeet-shared-lib';
import { FedaPay, Transaction } from 'fedapay';
import appConfig from 'src/config';
import paymentConfig from 'src/config/payment';
@Injectable()
export class FedapayService implements OnModuleInit {
  private readonly logger = new Logger(FedapayService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const { fedapay } = paymentConfig();
    FedaPay.setApiKey(fedapay.secretKey ?? '');
    FedaPay.setEnvironment(fedapay.environment ?? '');
  }

  /**
   * Retrieve a FedaPay customer by ID
   * @param id - The ID of the customer to retrieve
   * @param params - Optional query parameters
   * @param headers - Optional headers
   * @returns - The FedaPay customer object
   */
  async verifyTxn(txnId: number): Promise<Transaction> {
    try {
      const txn = await Transaction.retrieve(txnId);
      return txn;
    } catch (error) {
      this.logger.error('Error retrieving customer:', error.message);
      throw error;
    }
  }

  async createTransaction(payload: {
    amount: number;
    description: string;
  }): Promise<Transaction> {
    try {
      const { frontendUrl } = appConfig();
      const txn = await Transaction.create({
        description: payload.description,
        amount: payload.amount,
        currency: { iso: 'XOF' },
        callback_url: `${frontendUrl}/payment/callback`,
        mode: 'mtn_open',
      });
      return txn;
    } catch (error) {
      this.logger.error('Error creating transaction:', error.message);
      throw error;
    }
  }

  //webhook
  async webhook(payload: any) {
    try {
      this.logger.log('Webhook received:', payload);
      if (payload.object === 'transaction') {
        const txn = await this.verifyTxn(payload.id);
        this.logger.log({ txn });
        const order = await this.prisma.order.findUnique({
          where: { paymentIntentId: String(txn.id) },
        });
        if (!order) {
          this.logger.error('Order not found');
          throw new Error('Order not found');
        }
        if (txn.status === 'approved') {
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CONFIRMED,
              paymentStatus: PaymentStatus.COMPLETED,
            },
          });
          //send email to user
        } else {
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED,
            },
          });
        }
      }
      return true;
    } catch (error) {
      this.logger.error('Error processing webhook:', error.message);
      throw error;
    }
  }
}
