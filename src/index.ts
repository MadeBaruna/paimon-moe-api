import * as dotenv from 'dotenv';

import fastify from 'fastify';

import { Banner } from './entities/banner';
import { Wish } from './entities/wish';
import { Pull } from './entities/pull';

dotenv.config();

const server = fastify({ logger: { level: 'error' } });

void server.register(import('fastify-cors'), {
  origin: ['https://paimon.moe', 'https://www.paimon.moe', 'http://localhost:3000'],
});

void server.register(import('fastify-typeorm'), {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
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
});

void server.register(import('./routes/version'));
void server.register(import('./routes/wish'));
void server.register(import('./routes/corsProxy'));

async function start(): Promise<void> {
  try {
    const address = await server.listen(3001, '0.0.0.0');
    console.log(`Server listening at ${address}`);
  } catch (err) {
    console.error('Server failed to start!');
    console.error(err);
  }
}

void start();
