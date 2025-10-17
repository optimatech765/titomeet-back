import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Event,
  EventCategory,
  EventStatus,
  getPaginationData,
  PrismaService,
  ProviderCategory,
  ProviderStatus,
  UserRole,
  Provider,
  OrderStatus,
  Pricing,
} from '@optimatech88/titomeet-shared-lib';
import {
  AdminStatsDto,
  CreateEventCategoryDto,
  CreateProviderCategoryDto,
  EventStatsDto,
  GetFeedbacksQueryDto,
  GetUsersQueryDto,
  PricingBaseDto,
  UpdateEventStatusDto,
} from 'src/dto/admin.dto';
import { UpdateEventCategoryDto } from 'src/dto/events.dto';
import {
  UpdateProviderCategoryDto,
  ValidateProviderDto,
} from 'src/dto/providers.dto';
import { throwServerError } from 'src/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventValidation } from 'src/events/events';
import { EVENT_EVENTS } from 'src/utils/events';
import { GetNewsletterSubscriptions } from 'src/dto/mail.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  //EVENT CATEGORIES
  async createEventCategory(
    createEventCategoryDto: CreateEventCategoryDto,
  ): Promise<EventCategory> {
    try {
      const eventCategory = await this.prisma.eventCategory.create({
        data: createEventCategoryDto,
      });
      return eventCategory;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async updateEventCategory(
    id: string,
    payload: UpdateEventCategoryDto,
  ): Promise<EventCategory> {
    try {
      const eventCategory = await this.prisma.eventCategory.update({
        where: { id },
        data: payload,
      });
      return eventCategory;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async updateEventStatus(
    id: string,
    updateEventStatusDto: UpdateEventStatusDto,
  ): Promise<Event> {
    try {
      const event = await this.prisma.event.findUnique({ where: { id } });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          status: updateEventStatusDto.status,
        },
      });

      if (updateEventStatusDto.status === EventStatus.PUBLISHED) {
        const chatExists = await this.prisma.chat.findUnique({
          where: { eventId: id },
        });

        if (!chatExists) {
          //create event chat
          await this.prisma.chat.create({
            data: {
              id: event.id,
              name: event.name,
              eventId: event.id,
              users: {
                create: {
                  userId: event.postedById,
                },
              },
            },
          });
        }
      }

      const eventConfimation = new EventValidation();
      eventConfimation.eventId = id;
      eventConfimation.validated =
        updateEventStatusDto.status === EventStatus.PUBLISHED;
      this.eventEmitter.emit(EVENT_EVENTS.EVENT_VALIDATED, eventConfimation);

      return updatedEvent;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //provider categories
  async createProviderCategory(
    createProviderCategoryDto: CreateProviderCategoryDto,
  ): Promise<ProviderCategory> {
    try {
      const providerCategory = await this.prisma.providerCategory.create({
        data: createProviderCategoryDto,
      });
      return providerCategory;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async updateProviderCategory(
    payload: UpdateProviderCategoryDto,
  ): Promise<ProviderCategory> {
    try {
      const providerCategory = await this.prisma.providerCategory.update({
        where: { id: payload.id },
        data: payload,
      });
      return providerCategory;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async deleteProviderCategory(id: string): Promise<ProviderCategory> {
    try {
      const providerCategory = await this.prisma.providerCategory.delete({
        where: { id },
      });
      return providerCategory;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //providers
  async updateProviderStatus(
    id: string,
    payload: ValidateProviderDto,
  ): Promise<Provider> {
    try {
      const provider = await this.prisma.provider.update({
        where: { id },
        data: payload,
      });
      return provider;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async getAdminStats(): Promise<AdminStatsDto> {
    try {
      const totalUsers = await this.prisma.user.count({
        where: {
          role: UserRole.USER,
        },
      });

      const totalProviders = await this.prisma.provider.count({
        where: {
          status: ProviderStatus.APPROVED,
        },
      });

      const totalEvents = await this.prisma.event.count({
        where: {
          status: EventStatus.PUBLISHED,
        },
      });
      const totalBookings = await this.prisma.orderItem.count({
        where: {
          order: {
            status: OrderStatus.CONFIRMED,
          },
        },
      });

      return {
        totalUsers,
        totalProviders,
        totalEvents,
        totalBookings,
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //users
  async getUsers(query: GetUsersQueryDto) {
    try {
      const { search, role } = query;
      const { skip, page, limit } = getPaginationData(query);

      const where = {} as any;

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = role;
      }

      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        omit: {
          password: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.user.count({
        where,
      });

      return {
        items: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //events by status
  async getEventStats(): Promise<EventStatsDto> {
    try {
      const totalPendingEvents = await this.prisma.event.count({
        where: {
          status: EventStatus.PENDING,
        },
      });

      const totalPublishedEvents = await this.prisma.event.count({
        where: {
          status: EventStatus.PUBLISHED,
        },
      });

      const totalDraftEvents = await this.prisma.event.count({
        where: {
          status: EventStatus.DRAFT,
        },
      });

      const totalRejectedEvents = await this.prisma.event.count({
        where: {
          status: EventStatus.CANCELLED,
        },
      });

      return {
        totalPendingEvents,
        totalPublishedEvents,
        totalDraftEvents,
        totalRejectedEvents,
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //newsletter
  async getNewsletterSubscriptions(query: GetNewsletterSubscriptions) {
    try {
      const { search } = query;
      const { skip, page, limit } = getPaginationData(query);

      const where = {} as any;

      if (search) {
        where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
      }

      const subscriptions = await this.prisma.newsletter.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.newsletter.count({
        where,
      });

      return {
        items: subscriptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async createPricing(createPricingDto: PricingBaseDto): Promise<Pricing> {
    try {
      const pricing = await this.prisma.pricing.create({
        data: createPricingDto,
      });
      return pricing;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  async updatePricing(
    id: string,
    updatePricingDto: PricingBaseDto,
  ): Promise<Pricing> {
    try {
      const pricing = await this.prisma.pricing.update({
        where: { id },
        data: updatePricingDto,
      });
      return pricing;
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }

  //feedback
  async getFeedbacks(query: GetFeedbacksQueryDto) {
    try {
      const { search, categoryId, userId, email } = query;
      const { skip, page, limit } = getPaginationData(query);

      const where = {} as any;

      if (search) {
        where.OR = [
          { comment: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (email) {
        where.email = email;
      }

      const feedbacks = await this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prisma.feedback.count({
        where,
      });

      return {
        items: feedbacks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(error);
      return throwServerError(error);
    }
  }
}
