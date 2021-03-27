import * as dotenv from 'dotenv';

import fastify from 'fastify';
import { createConnection } from 'typeorm';

import { Banner } from './entities/banner';
import { Wish } from './entities/wish';
import { Pull } from './entities/pull';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();

const server = fastify({ logger: { level: 'error' } });

void server.register(import('fastify-cors'), {
  origin: ['https://paimon.moe', 'https://www.paimon.moe', 'http://localhost:3000'],
});

void server.register(import('./routes/version'));
void server.register(import('./routes/wish'));
void server.register(import('./routes/corsProxy'));

const dbOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Banner,
    Wish,
    Pull,
  ],
  synchronize: false,
  logging: false,
};

async function start(): Promise<void> {
  try {
    await createConnection(dbOptions);

    const address = await server.listen(3001, '0.0.0.0');
    console.log(`Server listening at ${address}`);
  } catch (err) {
    console.error('Server failed to start!');
    console.error(err);
  }
}

void start();
