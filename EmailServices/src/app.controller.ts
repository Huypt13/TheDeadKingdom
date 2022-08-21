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
  @EventPattern('sold')
  async confirmSold(data) {
    const { message, email, price, buyer, tankName, url } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: message,
      template: './soldTank',
      context: {
        message,
        buyer,
        price,
        tankName,
        url,
      },
    })

  }
  @EventPattern('bought')
  async confirmBought(data) {
    const { message, email, price, seller, tankName, url } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: message,
      template: './boughtTank',
      context: {
        message,
        seller,
        price,
        tankName,
        url,
      },
    })

  }
  @EventPattern('cancelListed')
  async confirmCancel(data) {
    const { message, email, price, tankName, url } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: message,
      template: './cancelSelling',
      context: {
        message,
        price,
        tankName,
        url,
      },
    })

  }
  @EventPattern('Listed')
  async confirmListed(data) {
    const { message, email, price, tankName, url } = data;
    console.log(data);
    await this.mailerService.sendMail({
      to: `${email}`,
      subject: message,
      template: './listed',
      context: {
        message,
        price,
        tankName,
        url,
      },
    })

  }
  @EventPattern('resetPassword')
  async resetPassword(data) {
    const { email,url } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: "Reset you password",
      template: './forgotPassword',
      context: {
        url
      },
    })

  }
  @EventPattern('boughtBox')
  async boughtBoxNotify(data) {
    const { email,url, message, price } = data;
    console.log(data);

    await this.mailerService.sendMail({
      to: `${email}`,
      subject: "Bought Box Notification",
      template: './boughtBox',
      context: {
        url, message, price
      },
    })

  }

  // @MessagePattern('test')
  // async test(@Payload() data: any, @Ctx() context: RmqContext) {
  //   console.log('zz');

  //   return 'aa';
  // }
}
