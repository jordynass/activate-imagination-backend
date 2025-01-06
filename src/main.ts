import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(process.env.PORT ?? 3000);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server...');
    await app.close();
    console.log('HTTP server closed');
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server...');
    await app.close();
    console.log('HTTP server closed');
  });
}
bootstrap();
