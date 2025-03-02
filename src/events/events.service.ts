import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Event,
  getPaginationData,
  PaginatedData,
  PaginationQuery,
  PrismaService,
  User,
  Participant,
} from '@optimatech88/titomeet-shared-lib';
import { AssetsService } from 'src/assets/assets.service';
import {
  CreateEventDto,
  GetEventsDto,
  UpdateEventDto,
} from 'src/dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

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

  async deleteEvent(id: string, user: User) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    if (user.id !== event.postedById) {
      throw new HttpException(
        'You are not allowed to delete this event',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    //delete assets
    const eventAssets = [];
    if (event.badge) {
      eventAssets.push(event.badge);
    }

    if (event.coverPicture) {
      eventAssets.push(event.coverPicture);
    }

    await this.assetsService.deleteAssets({
      fileNames: eventAssets,
    });

    return event;
  }

  async getEvents(
    payload: GetEventsDto,
    query: PaginationQuery,
    user: User,
  ): Promise<PaginatedData<Event>> {
    const { search, tags, startDate, endDate, createdById } = payload;

    const { page, limit, skip } = getPaginationData(query);

    const filter: any = {};

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (tags?.length) {
      filter.tags = {
        hasSome: tags,
      };
    }

    if (startDate) {
      filter.startDate = {
        gte: startDate,
      };
    }

    if (endDate) {
      filter.endDate = {
        lte: endDate,
      };
    }

    if (createdById) {
      filter.postedById = createdById;
    }

    const events = await this.prisma.event.findMany({
      where: filter,
      include: {
        prices: true,
        address: true,
        postedBy: true,
        participants: {
          where: {
            userId: user.id,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.event.count({
      where: filter,
    });

    return {
      items: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  //get event by id
  async getEventById(id: string, user: User): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        prices: true,
        address: true,
        postedBy: true,
        participants: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    return event;
  }

  //get event participants paginated
  async getEventParticipants(
    id: string,
    query: PaginationQuery,
  ): Promise<PaginatedData<Participant>> {
    const { page, limit, skip } = getPaginationData(query);

    const participants = await this.prisma.participant.findMany({
      where: { eventId: id },
      include: {
        user: true,
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.participant.count({
      where: { eventId: id },
    });

    return {
      items: participants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
