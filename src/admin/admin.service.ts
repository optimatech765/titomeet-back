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
} from '@optimatech88/titomeet-shared-lib';
import {
  AdminStatsDto,
  CreateEventCategoryDto,
  CreateProviderCategoryDto,
  GetUsersQueryDto,
  UpdateEventStatusDto,
} from 'src/dto/admin.dto';
import { UpdateEventCategoryDto } from 'src/dto/events.dto';
import {
  UpdateProviderCategoryDto,
  ValidateProviderDto,
} from 'src/dto/providers.dto';
import { throwServerError } from 'src/utils';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService) {}

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
}
