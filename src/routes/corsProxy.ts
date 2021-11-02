import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import CorsProxySchema from '../schemas/corsProxy.json';
import { CorsProxy } from '../types/corsProxy';

export default async function (server: FastifyInstance): Promise<void> {
  server.post<{ Body: CorsProxy }>(
    '/corsproxy',
    {
      schema: {
        body: CorsProxySchema,
      },
    },
    async function (req, reply) {
      const url = req.body.url;

      try {
        const response = await fetch('https://api2.paimon.moe/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        const json = await response.json();
        return json;
      } catch (err) {
        void reply.status(500);
        throw new Error(err as string);
      }
    });
}
