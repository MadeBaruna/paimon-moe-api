import { FastifyInstance } from 'fastify';

export default async function (server: FastifyInstance): Promise<void> {
  server.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'number' },
          },
        },
      },
    },
  }, async () => {
    return {
      name: 'Paimon.moe API',
      version: 1,
    };
  });
}
