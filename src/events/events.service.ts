import { Injectable } from '@nestjs/common';
import { Event, PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import { CreateEventDto } from 'src/dto/events.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(payload: CreateEventDto, user: User): Promise<Event> {
    const prices = payload.prices.map((price) => ({
      name: price.name,
      amount: price.amount,
      description: price.description,
    }));

    const event = await this.prisma.event.create({
      data: {
        ...payload,
        prices: {
          create: prices,
        },
        postedById: user.id,
      },
    });
    return event;
  }

  
}
