import * as dotenv from 'dotenv';

import fastify from 'fastify';
import { createConnection } from 'typeorm';

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Banner } from './entities/banner';
import { Wish } from './entities/wish';
import { Pull } from './entities/pull';
import { Reminder } from './entities/reminder';
import { WishTotal } from './entities/wishTotal';
import { Constellation } from './entities/constellation';

import { initFirebase } from './services/notification';
import { startReminderCron } from './services/reminder';

dotenv.config();

// init queue
/* eslint-disable import/first */
import './queue/wish';
import './queue/tally';
import './queue/wishTotal';
import './queue/wishSummary';
import './queue/wishConstellation';
import './queue/plausible';
/* eslint-enable import/first */

const server = fastify({
  logger: { level: 'error' },
  connectionTimeout: 30000,
});

void server.register(import('fastify-cors'), {
  origin: ['https://paimon.moe', 'https://www.paimon.moe', 'http://localhost:3000'],
});

void server.register(import('./routes/version'));
void server.register(import('./routes/wish'));
void server.register(import('./routes/corsProxy'));
void server.register(import('./routes/reminder'));
void server.register(import('./routes/visitor'));
void server.register(import('./routes/news'));

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
    Reminder,
    WishTotal,
    Constellation,
  ],
  synchronize: false,
  logging: false,
  migrations: ['migrations/*.*'],
  migrationsRun: true,
};

async function start(): Promise<void> {
  try {
    await createConnection(dbOptions);
    initFirebase();
    startReminderCron();

    const address = await server.listen(3001, '0.0.0.0');
    console.log(`Server listening at ${address}`);
  } catch (err) {
    console.error('Server failed to start!');
    console.error(err);
  }
}

void start();
