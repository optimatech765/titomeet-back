import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Event,
  getPaginationData,
  PaginatedData,
  PaginationQuery,
  PrismaService,
  User,
  EventCategory,
  EventStatus,
  EventAccess,
  OrderStatus,
} from '@optimatech88/titomeet-shared-lib';
import { AssetsService } from 'src/assets/assets.service';
import {
  CreateEventDto,
  GetEventsQueryDto,
  UpdateEventDto,
  EventCategoryQueryDto,
  EventQueryStatus,
  ParticipantDto,
} from 'src/dto/events.dto';
import { CreateOrderDto, OrderDto } from 'src/dto/orders.dto';
import { throwServerError } from 'src/utils';
import { FedapayService } from 'src/fedapay/fedapay.service';
import { OrderConfirmationEvent, PopulatedOrder } from 'src/orders/events';
import { ORDER_EVENTS } from 'src/utils/events';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
    private readonly fedapayService: FedapayService,
    private readonly eventEmitter: EventEmitter2,
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

      if (query.parentId) {
        filter.parentId = query.parentId;
      } else {
        filter.parentId = null;
      }

      const categories = await this.prisma.eventCategory.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        include: {
          children: true,
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

      /* const activeSubscription = await this.prisma.transaction.findFirst({
        where: {
          userId: user.id,
          status: TransactionStatus.COMPLETED,
          pricing: {
            type: PricingType.EVENT_CREATOR,
          },
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (!activeSubscription) {
        throw new HttpException(
          'You do not have an active subscription',
          HttpStatus.BAD_REQUEST,
        );
      } */

      const _prices =
        prices ??
        (rest.accessType === EventAccess.FREE
          ? [
              {
                name: 'Ticket',
                amount: 0,
                description: '',
              },
            ]
          : []);

      if (_prices.length === 0 && rest.accessType === EventAccess.PAID) {
        throw new HttpException('Prices are required', HttpStatus.BAD_REQUEST);
      }

      const _providers = providers ?? [];
      const allow = false;

      const status = EventStatus.PUBLISHED;
      /* const status = allow
        ? EventStatus.PUBLISHED
        : isDraft
          ? EventStatus.DRAFT
          : EventStatus.PENDING; */

      const event = await this.prisma.event.create({
        data: {
          ...rest,
          type: payload.type,
          remainingSeats: rest.capacity,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          badge: payload.badge ?? '',
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
          postedById: user.id,
        },
        include: {
          prices: true,
          address: true,
          postedBy: true,
        },
      });

      if (_providers.length > 0) {
        await this.prisma.providerOnEvent.createMany({
          data: _providers.map((provider) => ({
            providerId: provider,
            eventId: event.id,
          })),
        });
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

  async updateEvent(payload: UpdateEventDto, user: User): Promise<Event> {
    try {
      const { id, providers, prices, ...rest } = payload;
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          prices: true,
          providers: true,
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
      const _prices =
        prices ??
        (rest.accessType === EventAccess.FREE
          ? [
              {
                name: 'Ticket',
                amount: 0,
                description: '',
              },
            ]
          : []);

      if (_prices.length === 0 && rest.accessType === EventAccess.PAID) {
        throw new HttpException('Prices are required', HttpStatus.BAD_REQUEST);
      }

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

      //handle price deletion
      const pricesDelete = event.prices.filter(
        (price) => !_prices.find((p) => p.id === price.id),
      );
      if (pricesDelete.length > 0) {
        await this.prisma.eventPrice.deleteMany({
          where: { id: { in: pricesDelete.map((p) => p.id) } },
        });
        this.logger.log(
          `Deleting ${pricesDelete.length} prices for event ${id}`,
        );
      }

      const status =
        event.status === EventStatus.CANCELLED ||
        (event.status === EventStatus.DRAFT && !payload.isDraft)
          ? EventStatus.PENDING
          : event.status;

      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          name: rest.name,
          description: rest.description,
          startDate: new Date(payload.startDate),
          endDate: new Date(payload.endDate),
          startTime: payload.startTime,
          endTime: payload.endTime,
          coverPicture: rest.coverPicture,
          badge: rest.badge,
          capacity: rest.capacity,
          status,
          tags: rest.tags,
          accessType: rest.accessType,
          visibility: rest.visibility,
          postedById: event.postedById,
          addressId: event.addressId,
          type: payload.type,
          ticketHandler: payload.ticketHandler,
          ticketUrl: payload.ticketUrl,
          onlineLink: payload.onlineLink,
          lat: payload.lat,
          lng: payload.lng,
          location: payload.location,
          ...(rest.badge && { badge: rest.badge }),
          categories: {
            connect: payload.categories.map((category) => ({
              id: category,
            })),
          } /* 
          ...(_providers.length > 0 && {
            providers: {
              connect: _providers.map((provider) => ({
                id: provider,
              })),
            },
          }), */,
        },
        include: {
          prices: true,
          address: true,
          postedBy: true,
        },
      });

      if (_providers.length > 0) {
        const newProviders = _providers.filter(
          (provider) => !event.providers.find((p) => p.providerId === provider),
        );
        const deletedProviders = event.providers
          .filter((p) => !_providers.includes(p.providerId))
          .map((p) => p.providerId);

        await this.prisma.providerOnEvent.deleteMany({
          where: { providerId: { in: deletedProviders } },
        });

        await this.prisma.providerOnEvent.createMany({
          data: newProviders.map((provider) => ({
            providerId: provider,
            eventId: id,
          })),
        });
      }

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

      await this.prisma.providerOnEvent.deleteMany({
        where: { eventId: id },
      });

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

  async calculateRemainingSeats(event: Event) {
    const orders = await this.prisma.order.findMany({
      where: {
        eventId: event.id,
        status: OrderStatus.CONFIRMED,
      },
      include: {
        items: {
          include: {
            eventPrice: true,
          },
        },
      },
    });

    const totalSeatsBooked = orders.reduce(
      (acc, order) =>
        acc +
        order.items.reduce(
          (acc, item) => acc + item.quantity * item.eventPrice.totalSeats,
          0,
        ),
      0,
    );

    const remainingSeats = event.capacity - totalSeatsBooked;

    return remainingSeats;
  }

  async getEvents(
    query: GetEventsQueryDto,
    user?: User,
  ): Promise<PaginatedData<Event>> {
    try {
      const {
        search,
        tags,
        startDate,
        endDate,
        createdById,
        status,
        attendeeId,
        categories,
        interests,
        location,
      } = query;

      const { page, limit, skip } = getPaginationData(query);

      const filter: any = {};

      if (search) {
        filter.OR = [
          { name: { startsWith: search, mode: 'insensitive' } },
          //{ description: { contains: search, mode: 'insensitive' } },
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

      if (categories?.length) {
        const _categories = categories.split(',');
        filter.categories = {
          some: {
            id: {
              in: _categories,
            },
          },
        };
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
            filter.favorites = {
              some: {
                userId: user.id,
              },
            };
          }
        }
      }

      if (location) {
        filter.address = {
          OR: [
            {
              name: {
                contains: location,
                mode: 'insensitive',
              },
            },
            {
              city: {
                contains: location,
                mode: 'insensitive',
              },
            },
            {
              state: {
                contains: location,
                mode: 'insensitive',
              },
            },
            {
              country: {
                contains: location,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      if (attendeeId) {
        filter.orders = {
          some: {
            userId: attendeeId,
          },
        };
      }

      if (String(interests) === 'true' && user) {
        const userInterests = await this.prisma.userInterests.findUnique({
          where: {
            id: user.id,
          },
          include: {
            interests: {
              select: {
                parentId: true,
              },
            },
          },
        });

        const parentCategories = userInterests?.interests.map(
          (interest) => interest.parentId,
        );

        filter.categories = {
          some: {
            id: {
              in: parentCategories,
            },
          },
        };
      }

      const events = await this.prisma.event.findMany({
        where: filter,
        include: {
          prices: true,
          address: true,
          postedBy: true,
          categories: true,
          providers: true,
          ...(user && {
            orders: {
              where: {
                userId: user.id,
              },
            },
            favorites: {
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

      const items = events.map((event) => {
        return {
          ...event,
          isAttending: event.orders?.length > 0,
          isFavorite: event.favorites?.length > 0,
        };
      });

      const total = await this.prisma.event.count({
        where: filter,
      });

      return {
        items,
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
  async getEventById(
    id: string,
    user?: User,
  ): Promise<Event & { ticketsSold: number; ticketsSoldByEventPrice: any }> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          prices: true,
          address: true,
          postedBy: true,
          categories: true,
          providers: true,
          ...(user && {
            orders: {
              where: {
                userId: user.id,
              },
            },
            favorites: {
              where: {
                userId: user.id,
              },
            },
          }),
        },
      });

      const ticketsSold = await this.prisma.orderItem.count({
        where: {
          eventPrice: {
            eventId: id,
          },
          order: {
            status: OrderStatus.CONFIRMED,
          },
        },
      });

      //count tickets sold by eventPrice
      const ticketsSoldByEventPrice = await this.prisma.orderItem.groupBy({
        by: ['eventPriceId'],
        _count: true,
        where: {
          eventPrice: {
            eventId: id,
          },
        },
      });

      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }

      return {
        ...event,
        ticketsSold,
        ticketsSoldByEventPrice,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //get event orders paginated
  async getEventOrders(
    id: string,
    query: PaginationQuery,
  ): Promise<PaginatedData<OrderDto>> {
    const { page, limit, skip } = getPaginationData(query);

    const participants = await this.prisma.order.findMany({
      where: { eventId: id, status: OrderStatus.CONFIRMED },
      include: {
        user: true,
        items: {
          include: {
            eventPrice: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.order.count({
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

  //add event to favorites
  async toggleFavorite(id: string, user: User) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }

      const favorite = await this.prisma.favorite.findFirst({
        where: {
          eventId: id,
          userId: user.id,
        },
      });

      if (favorite) {
        await this.prisma.favorite.delete({
          where: { id: favorite.id },
        });

        return {
          message: 'Event removed from favorites',
        };
      }

      await this.prisma.favorite.create({
        data: { eventId: id, userId: user.id },
      });

      return {
        message: 'Event added to favorites',
      };
    } catch (error) {
      throwServerError(error);
    }
  }

  async createOrder(payload: CreateOrderDto, authUser?: User) {
    try {
      const { eventId, email, items, firstName, lastName } = payload;
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw new HttpException(
          'Event is not published',
          HttpStatus.BAD_REQUEST,
        );
      }

      const endDate = new Date(event.endDate);

      const isPassEvent = endDate < new Date();

      if (isPassEvent) {
        throw new HttpException(
          'Event is already passed',
          HttpStatus.BAD_REQUEST,
        );
      }

      const eventPrices = await this.prisma.eventPrice.findMany({
        where: {
          id: {
            in: items.map((item) => item.priceId),
          },
        },
      });

      //calculate total seats to buy
      const totalSeatToBuy = items.reduce((acc, item) => {
        const eventPrice = eventPrices.find(
          (price) => price.id === item.priceId,
        );
        if (!eventPrice) {
          throw new HttpException('Invalid price id', HttpStatus.BAD_REQUEST);
        }
        return acc + item.quantity * eventPrice.totalSeats;
      }, 0);

      //check the remaining seats can fit the total seats to buy
      if (event.remainingSeats < totalSeatToBuy) {
        throw new HttpException(
          'Event seats are not enough',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!authUser && (!email || !firstName || !lastName)) {
        throw new HttpException(
          'Le nom, prénom et email sont requis',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user =
        authUser ??
        (await this.prisma.user.findUnique({
          where: { email },
        })) ??
        (await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            username: email,
          },
        }));

      const orderItems = items.map((item) => ({
        quantity: item.quantity,
        unitPrice:
          eventPrices.find((price) => price.id === item.priceId)?.amount ?? 0,
        eventPriceId: item.priceId,
      }));

      const totalAmount = orderItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      );

      const isPaidEvent = event.accessType === EventAccess.PAID;
      const totalQty = orderItems.reduce((acc, item) => acc + item.quantity, 0);

      if (!isPaidEvent && totalQty > 3) {
        throw new HttpException(
          'You cannot buy more than 3 tickets at once',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (isPaidEvent && totalAmount === 0) {
        throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);
      }

      if (isPaidEvent && orderItems.length === 0) {
        throw new HttpException('Invalid items', HttpStatus.BAD_REQUEST);
      }

      const order = await this.prisma.order.create({
        data: {
          eventId,
          userId: user.id,
          email,
          totalAmount,
          items: {
            create: orderItems,
          },
          status: !isPaidEvent ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
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

      if (isPaidEvent) {
        const txn = await this.fedapayService.createTransaction({
          amount: totalAmount,
          description: `Payment for order #${order.id}`,
          callbackUrl: payload.callbackUrl,
          customer: {
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
          },
          user,
        });

        //this.logger.log({ txn });

        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentIntentId: String(txn.id),
          },
        });

        const paymentLink =
          await this.fedapayService.createTransactionPaymentLink(txn.id);

        return { paymentLink, order };
      } else {
        //send email to user
        const confirmationEvent = new OrderConfirmationEvent();
        confirmationEvent.order = order as PopulatedOrder;
        this.eventEmitter.emit(ORDER_EVENTS.ORDER_CONFIRMED, confirmationEvent);
      }

      return {
        message: 'Order created successfully',
        order,
      };
    } catch (error) {
      this.logger.error(error);
      throwServerError(error);
    }
  }

  //get event participants paginated
  async getEventParticipants(
    id: string,
    query: PaginationQuery,
  ): Promise<PaginatedData<ParticipantDto>> {
    this.logger.log(`Getting event participants for event ${id}`);
    const { page, limit, skip } = getPaginationData(query);

    const usersFilter = {
      orders: {
        some: { eventId: id, status: OrderStatus.CONFIRMED },
      },
    };

    const users = await this.prisma.user.findMany({
      where: usersFilter,
      skip,
      take: limit,
    });

    const total = await this.prisma.user.count({
      where: usersFilter,
    });

    const p = users.map(async (user) => {
      const orders = await this.prisma.order.findMany({
        where: { userId: user.id, eventId: id, status: OrderStatus.CONFIRMED },
        include: { items: true },
      });

      const totalOrders = orders.length;
      const totalTickets = orders.reduce((acc, order) => {
        return (
          acc +
          order.items.reduce((acc, item) => {
            return acc + item.quantity;
          }, 0)
        );
      }, 0);

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        totalOrders,
        totalTickets,
      };
    });

    const participants = await Promise.all(p);

    return {
      items: participants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
