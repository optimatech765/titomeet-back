import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Event, PrismaService, User } from '@optimatech88/titomeet-shared-lib';
import { CreateEventDto, UpdateEventDto } from 'src/dto/events.dto';

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
      include: {
        prices: true,
        address: true,
        postedBy: true,
      },
    });
    return event;
  }

  async updateEvent(payload: UpdateEventDto, user: User): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id: payload.id },
      include: {
        prices: true,
      },
    });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    if (user.id !== event.postedById) {
      throw new HttpException(
        'You are not allowed to update this event',
        HttpStatus.FORBIDDEN,
      );
    }

    //handle one price usecase

    if (payload.prices.length > 1) {
      throw new HttpException(
        'Multiprices not handle yet',
        HttpStatus.FORBIDDEN,
      );
    }

    const price = payload.prices[0];

    const updatedEvent = await this.prisma.event.update({
      where: { id: payload.id },
      data: {
        ...payload,
        prices: {
          update: {
            where: { id: event.prices[0].id },
            data: price,
          },
        },
      },
      include: {
        prices: true,
        address: true,
        postedBy: true,
      },
    });
    return updatedEvent;
  }
}
