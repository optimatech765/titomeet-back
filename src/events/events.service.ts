import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Event,
  getPaginationData,
  PaginatedData,
  PaginationQuery,
  PrismaService,
  User,
  Participant,
  EventCategory,
  EventStatus,
} from '@optimatech88/titomeet-shared-lib';
import { AssetsService } from 'src/assets/assets.service';
import {
  CreateEventDto,
  GetEventsQueryDto,
  UpdateEventDto,
  EventCategoryQueryDto,
  EventQueryStatus,
} from 'src/dto/events.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async getEventCategories(
    query: EventCategoryQueryDto,
  ): Promise<PaginatedData<EventCategory>> {
    try {
      const { page, limit, skip } = getPaginationData(query);

      const filter: any = {};

      if (query.search) {
        filter.name = {
          contains: query.search,
        };
      }

      const categories = await this.prisma.eventCategory.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });

      const total = await this.prisma.eventCategory.count({
        where: filter,
      });

      return {
        items: categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createEvent(payload: CreateEventDto, user: User): Promise<Event> {
    try {
      const { isDraft, prices, providers, ...rest } = payload;

      const _prices = prices ?? [];
      const _providers = providers ?? [];

      const allow = true;

      const status = allow
        ? EventStatus.PUBLISHED
        : isDraft
          ? EventStatus.DRAFT
          : EventStatus.PENDING;

      const event = await this.prisma.event.create({
        data: {
          ...rest,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          status,
          ...(_prices.length > 0 && {
            prices: {
              create: prices,
            },
          }),
          categories: {
            connect: payload.categories.map((category) => ({
              id: category,
            })),
          },
          ...(_providers.length > 0 && {
            providers: {
              connect: _providers.map((provider) => ({
                id: provider,
              })),
            },
          }),
          postedById: user.id,
        },
        include: {
          prices: true,
          address: true,
          postedBy: true,
        },
      });
      return event;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEvent(payload: UpdateEventDto, user: User): Promise<Event> {
    try {
      const { id, providers, prices, ...rest } = payload;
      const event = await this.prisma.event.findUnique({
        where: { id },
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

      const _providers = providers ?? [];
      const _prices = prices ?? [];

      //check if event has price and if its any price changed
      if (_prices.length > 0) {
        const pricesChanged = event.prices.filter((price) =>
          _prices.find(
            (p) =>
              p.id === price.id &&
              (p.amount !== price.amount ||
                p.name !== price.name ||
                p.description !== price.description),
          ),
        );
        //handle price updates
        if (pricesChanged.length > 0) {
          const pricesUpdate = pricesChanged.map(async (price) => {
            await this.prisma.eventPrice.update({
              where: { id: price.id },
              data: {
                name: price.name,
                amount: price.amount,
                description: price.description,
              },
            });
          });

          this.logger.log(
            `Updating ${pricesChanged.length} prices for event ${id}`,
          );
          await Promise.all(pricesUpdate);
        }

        //handle price creation
        const pricesCreate = _prices
          .filter((price) => !event.prices.find((p) => p.id === price.id))
          .map((price) => ({
            ...price,
            eventId: id,
          }));

        if (pricesCreate.length > 0) {
          await this.prisma.eventPrice.createMany({
            data: pricesCreate,
          });
          this.logger.log(
            `Creating ${pricesCreate.length} prices for event ${id}`,
          );
        }
      }

      const status =
        event.status === EventStatus.CANCELLED
          ? EventStatus.PENDING
          : event.status;

      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          ...rest,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          status,
          postedById: event.postedById,
          /* ...(_prices.length > 0 && {
            prices: {
              connectOrCreate: _prices.map((price) => ({
                where: { id: price.id },
                create: price,
              })),
            },
          }), */
          categories: {
            connect: payload.categories.map((category) => ({
              id: category,
            })),
          },
          ...(_providers.length > 0 && {
            providers: {
              connect: _providers.map((provider) => ({
                id: provider,
              })),
            },
          }),
        },
        include: {
          prices: true,
          address: true,
          postedBy: true,
        },
      });

      return updatedEvent;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteEvent(id: string, user: User) {
    try {
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
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEvents(
    query: GetEventsQueryDto,
    user?: User,
  ): Promise<PaginatedData<Event>> {
    try {
      const { search, tags, startDate, endDate, createdById, status } = query;

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
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        filter.endDate = {
          lte: new Date(endDate),
        };
      }

      if (createdById) {
        filter.postedById = createdById;
      }

      if (status) {
        const validStatuses = [
          EventStatus.DRAFT,
          EventStatus.PENDING,
          EventStatus.PUBLISHED,
          EventStatus.CANCELLED,
        ] as const;

        if (validStatuses.includes(status as EventStatus)) {
          filter.status = status as EventStatus;
        } else {
          if (status === EventQueryStatus.FINISHED) {
            filter.endDate = {
              lte: new Date(),
            };
          }

          if (status === EventQueryStatus.FAVORITE && user) {
            filter.participants = {
              some: {
                userId: user.id,
              },
            };
          }
        }
      }

      const events = await this.prisma.event.findMany({
        where: filter,
        include: {
          prices: true,
          address: true,
          postedBy: true,
          ...(user && {
            participants: {
              where: {
                userId: user.id,
              },
            },
          }),
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
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //get event by id
  async getEventById(id: string, user: User): Promise<Event> {
    try {
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
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
