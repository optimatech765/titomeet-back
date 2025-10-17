import { Body, Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { NewsLetterDto } from '../dto/mail.dto';

@ApiTags('Mail')
@Controller('api/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('newsletter/subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to newsletter',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid email',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already subscribed',
  })
  async subscribeToNewsletter(@Body() newsletterDto: NewsLetterDto) {
    return this.mailService.subscribeToNewsletter(newsletterDto);
  }
}
