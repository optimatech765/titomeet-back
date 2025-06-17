import { NotificationDto } from "src/dto/notifications.dto";

export class ForgotPasswordEvent {
  email: string;
  username: string;
  token: string;
}

export class SendNotificationByMailEvent {
  notification: NotificationDto;
}