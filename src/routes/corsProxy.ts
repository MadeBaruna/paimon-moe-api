import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import pRetry from 'p-retry';

import createHttpProxyAgent from 'https-proxy-agent';
import CorsProxySchema from '../schemas/corsProxy.json';
import { CorsProxy } from '../types/corsProxy';

const proxyAgent = createHttpProxyAgent(process.env.PROXY_URL as string);

function fetchResult(url: string) {
  return async () => {
    const response = await fetch(url, {
      agent: proxyAgent,
    });
    return await response.json();
  };
}

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
        return await pRetry(fetchResult(url), { retries: 2 });
      } catch (err) {
        void reply.status(500);
        throw new Error(err as string);
      }
    });
}
