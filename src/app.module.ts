import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameSessionGateway } from './game_session/game_session.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule available globally
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GameSessionGateway],
})
export class AppModule {}