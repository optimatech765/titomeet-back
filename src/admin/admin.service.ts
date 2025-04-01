import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import {
  Event,
  EventCategory,
  EventStatus,
  PrismaService,
  ProviderCategory,
  ProviderStatus,
  UserRole,
} from '@optimatech88/titomeet-shared-lib';
import {
  AdminStatsDto,
  CreateEventCategoryDto,
  CreateProviderCategoryDto,
  UpdateEventStatusDto,
} from 'src/dto/admin.dto';
import { UpdateEventCategoryDto } from 'src/dto/events.dto';
import {
  CreateProviderDto,
  UpdateProviderCategoryDto,
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
      const totalBookings = await this.prisma.participant.count({
        where: {
          event: {
            status: EventStatus.PUBLISHED,
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
}
