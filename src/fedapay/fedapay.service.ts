import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FedaPay, Transaction } from 'fedapay';
import paymentConfig from 'src/config/payment';

@Injectable()
export class FedapayService implements OnModuleInit {
  private readonly logger = new Logger(FedapayService.name);

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
      const txn = await Transaction.create({
        description: payload.description,
        amount: payload.amount,
        currency: { iso: 'XOF' },
        callback_url: 'https://example.com/callback',
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
    } catch (error) {
      this.logger.error('Error processing webhook:', error.message);
      throw error;
    }
  }
}
