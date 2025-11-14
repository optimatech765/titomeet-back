import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { NewsLetterDto } from '../dto/mail.dto';

describe('MailController', () => {
  let controller: MailController;
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: {
            subscribeToNewsletter: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribeToNewsletter', () => {
    it('should subscribe to newsletter successfully', async () => {
      const newsletterDto: NewsLetterDto = {
        email: 'test@example.com',
      };

      const expectedResult = {
        success: true,
        message: 'Successfully subscribed to newsletter',
        email: 'test@example.com',
      };

      jest
        .spyOn(service, 'subscribeToNewsletter')
        .mockResolvedValue(expectedResult);

      const result = await controller.subscribeToNewsletter(newsletterDto);

      expect(service.subscribeToNewsletter).toHaveBeenCalledWith(newsletterDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
