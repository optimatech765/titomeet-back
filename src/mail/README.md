# Mail Module - Newsletter Subscription

This module provides newsletter subscription functionality for the Ayiru platform.

## Features

- **Subscribe to Newsletter**: Users can subscribe to receive newsletter updates
- **Unsubscribe from Newsletter**: Users can unsubscribe from newsletter updates
- **Email Notifications**: Automatic welcome and unsubscribe confirmation emails
- **Database Persistence**: Subscription data is stored and managed

## API Endpoints

### Subscribe to Newsletter

**POST** `/mail/newsletter/subscribe`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "email": "user@example.com"
}
```

**Status Codes:**

- `201`: Successfully subscribed
- `400`: Bad request - invalid email
- `409`: Email already subscribed

### Unsubscribe from Newsletter

**POST** `/mail/newsletter/unsubscribe`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter",
  "email": "user@example.com"
}
```

**Status Codes:**

- `200`: Successfully unsubscribed
- `400`: Bad request - invalid email
- `404`: Email not found in subscriptions

## Architecture

### Components

1. **MailController**: Handles HTTP requests for newsletter operations
2. **MailService**: Business logic for newsletter subscription management
3. **NewsletterRepository**: Data access layer for subscription persistence
4. **NewsletterSubscription**: Entity representing a newsletter subscription

### Data Model

```typescript
interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Notes

- Currently uses in-memory storage for subscriptions (can be replaced with database)
- Sends welcome email upon subscription
- Sends confirmation email upon unsubscription
- Prevents duplicate subscriptions
- Allows reactivation of unsubscribed emails

## Future Enhancements

- Database integration (PostgreSQL/MySQL)
- Email templates with dynamic content
- Newsletter sending functionality
- Subscription analytics
- Email validation and verification
- Rate limiting for subscription requests
