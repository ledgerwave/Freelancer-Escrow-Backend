import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
describe('AppController', () => {
  let app: INestApplication & { get: (token: symbol) => any };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication<INestApplication>();
    SwaggerModule.setup('api', app, app.get(SwaggerModule));
    await app.init();
  });
});
