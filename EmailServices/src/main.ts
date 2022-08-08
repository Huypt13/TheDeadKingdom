import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqps://xdtwwtef:XT_JcoaRWjuLnWOMpimCBNyUgY_ZYtPu@armadillo.rmq.cloudamqp.com/xdtwwtef',
        ],
        queue: 'notification_queue',
        noAck: true,
        queueOptions: {
          durable: false,
          messageTtl: 40000,
        },
      },
    },
  );
  app.listen();
}

async function bootstrap2() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(process.env.PORT || 4005).then(() => {
    console.log('listent at ', process.env.PORT || 4005);
  });
}
bootstrap2();

bootstrap();
