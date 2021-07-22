import { FastifyInstance } from 'fastify';
import { getVisitorCount } from '../queue/plausible';

export default async function (server: FastifyInstance): Promise<void> {
  server.get('/visitor', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            count: { type: 'number' },
          },
        },
      },
    },
  }, async () => {
    return {
      count: getVisitorCount(),
    };
  });
}
