export class ForgotPasswordEvent {
  email: string;
  username: string;
  token: string;
}

export class OrderConfirmationEvent {
  orderId: string;
}
