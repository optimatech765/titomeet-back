import {
  Address,
  Event,
  Order,
  OrderItem,
  User,
  EventPrice,
} from '@optimatech88/titomeet-shared-lib';

export interface PopulatedOrderItem extends OrderItem {
  eventPrice: EventPrice;
}

export interface PopulatedOrder extends Order {
  event: Event & {
    address: Address | null;
  };
  user: User;
  items: PopulatedOrderItem[];
}

export class OrderConfirmationEvent {
  order: PopulatedOrder;
}
