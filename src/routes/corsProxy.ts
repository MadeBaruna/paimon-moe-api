import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import pRetry from 'p-retry';

import createHttpProxyAgent from 'https-proxy-agent';
import CorsProxySchema from '../schemas/corsProxy.json';
import { CorsProxy } from '../types/corsProxy';
import { errors, proxyresets, getProxy, unassignProxy } from '../stores/proxy';
import { authorization } from '../hooks/auth';

function fetchResult(url: string, proxy: string) {
  return async () => {
    const proxyAgent = createHttpProxyAgent(proxy);
    const response = await fetch(url, {
      agent: proxyAgent,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType?.includes('application/json') === true) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      data,
      status: response.status,
    };
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
      const ip = req.headers['cf-connecting-ip'] as string ?? req.ip;
      const proxy = await getProxy(ip);

      try {
        const { data, status } = await pRetry(fetchResult(url, proxy), { retries: 2 });

        if (status !== 200) {
          if (errors[proxy] === undefined) {
            errors[proxy] = 0;
          }
          errors[proxy]++;

          void unassignProxy(ip);
        }

        void reply.code(status);
        return data;
      } catch (err) {
        if (errors[proxy] === undefined) {
          errors[proxy] = 0;
        }
        errors[proxy]++;

        void unassignProxy(ip);
        void reply.status(500);
        throw new Error(err as string);
      }
    });

  server.get(
    '/corsreset',
    async function (req) {
      const ip = req.headers['cf-connecting-ip'] as string ?? req.ip;
      const proxy = await getProxy(ip);

      if (proxyresets[proxy] === undefined) {
        proxyresets[proxy] = 0;
      }
      proxyresets[proxy]++;
      void unassignProxy(ip);

      return { status: 'ok' };
    },
  );

  server.get(
    '/corsstatus',
    {
      preHandler: authorization,
    },
    async function () {
      return JSON.stringify({ errors, proxyresets }, null, 2);
    },
  );
}
