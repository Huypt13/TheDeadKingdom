import { Controller, Get } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(private readonly mailerService: MailerService) { }

  @Get()
  hello(): string {
    return 'lala';
  }
  @EventPattern('register')
  async confirmPassword(data) {
    const { email, username, url } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: 'Confirm email',
      template: './register',
      context: {
        username,
        url,
      },
    });

  }

  // @MessagePattern('test')
  // async test(@Payload() data: any, @Ctx() context: RmqContext) {
  //   console.log('zz');

  //   return 'aa';
  // }
}
