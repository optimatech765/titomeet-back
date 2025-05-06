import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  PrismaService,
} from '@optimatech88/titomeet-shared-lib';
import axios from 'axios';
import { FedaPay, Transaction } from 'fedapay';
import appConfig from 'src/config';
import paymentConfig from 'src/config/payment';
import { OrderConfirmationEvent } from 'src/orders/events';
import { ORDER_EVENTS } from 'src/utils/events';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class FedapayService implements OnModuleInit {
  private readonly logger = new Logger(FedapayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      this.logger.error('Error retrieving transaction:', error.message);
      throw error;
    }
  }

  async createTransaction(payload: {
    amount: number;
    description: string;
    callbackUrl?: string;
    customer: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }): Promise<Transaction> {
    try {
      const { frontendUrl } = appConfig();
      const callbackUrl =
        payload.callbackUrl ?? `${frontendUrl}/payment/callback`;
      const txn = await Transaction.create({
        description: payload.description,
        amount: payload.amount,
        currency: { iso: 'XOF' },
        callback_url: callbackUrl,
        mode: 'mtn_open',
        customer: payload.customer,
      });
      return txn;
    } catch (error) {
      this.logger.error('Error creating transaction:', error.message);
      throw error;
    }
  }

  async createTransactionPaymentLink(transactionId: number) {
    try {
      const { fedapay } = paymentConfig();
      const { data } = await axios.post(
        `${fedapay.apiUrl}/v1/transactions/${transactionId}/token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${fedapay.secretKey}`,
          },
        },
      );
      //this.logger.log('Transaction payment link created:', data);
      return {
        url: data.url,
        transactionId: data.id,
      };
    } catch (error) {
      this.logger.error(
        'Error creating transaction payment link:',
        error.message,
      );
      throw error;
    }
  }

  //webhook
  async webhook(payload: any) {
    try {
      this.logger.log('Webhook received:', payload);
      if (payload.object === 'transaction') {
        const txnId = payload.entity.id;
        const txn = await this.verifyTxn(txnId);
        //this.logger.log({ txn });
        const order = await this.prisma.order.findUnique({
          where: { paymentIntentId: String(txn.id) },
        });
        if (!order) {
          this.logger.error('Order not found');
          throw new Error('Order not found');
        }
        if (txn.status === 'approved') {
          const updatedOrder = await this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CONFIRMED,
              paymentStatus: PaymentStatus.COMPLETED,
            },
            include: {
              event: {
                include: {
                  address: true,
                },
              },
              user: true,
              items: {
                include: {
                  eventPrice: true,
                },
              },
            },
          });
          //send email to user
          const confirmationEvent = new OrderConfirmationEvent();
          confirmationEvent.order = updatedOrder;
          this.eventEmitter.emit(
            ORDER_EVENTS.ORDER_CONFIRMED,
            confirmationEvent,
          );
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
