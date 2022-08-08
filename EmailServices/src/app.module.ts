import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        return {
          transport: {
            host: `smtp.gmail.com`,
            secure: true, // ssl
            port: 465,
            auth: {
              user: `${process.env.EMAIL}`,
              pass: `${process.env.PASSWORD}`,
            },
          },
          defaults: {
            from: `"No Reply" <noreply@gmail.com>`,
          },
          template: {
            dir: join(__dirname, 'teamplate'),
            adapter: new EjsAdapter(),
            options: { strict: false },
          },
        };
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
