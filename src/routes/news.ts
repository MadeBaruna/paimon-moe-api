import { FastifyInstance } from 'fastify';
import HttpErrors from 'http-errors';

import { redis } from '../redis';
import NewsRequestSchema from '../schemas/newsRequest.json';
import { NewsRequest } from '../types/newsRequest';
import NewsSetRequestSchema from '../schemas/newsSetRequest.json';
import { NewsSetRequest } from '../types/newsSetRequest';
import { authorization } from '../hooks/auth';

export default async function (server: FastifyInstance): Promise<void> {
  server.get<{ Params: NewsRequest }>('/news/:type', {
    schema: {
      params: NewsRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request) => {
    const message = await redis.get(`news:${request.params.type}`);
    if (message === null) {
      throw new HttpErrors.NotFound();
    }

    return { message };
  });

  server.post<{ Body: NewsSetRequest }>('/news', {
    preHandler: authorization,
    schema: {
      body: NewsSetRequestSchema,
    },
  }, async (request) => {
    const { type, message } = request.body;
    await redis.set(`news:${type}`, message);
    return {
      type, message,
    };
  });
}
