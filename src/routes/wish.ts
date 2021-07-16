import { FastifyInstance } from 'fastify';

import WishDataSchema from '../schemas/wishData.json';
import WishRequestSchema from '../schemas/wishRequest.json';
import { WishRequest } from '../types/wishRequest';
import { WishData } from '../types/wishData';
import { getWishTallyData } from '../services/wish';

import { banners } from '../data/banners';
import { pushQueue } from '../services/wishQueue';

export default async function (server: FastifyInstance): Promise<void> {
  server.get<{ Querystring: WishRequest }>(
    '/wish',
    {
      schema: {
        querystring: WishRequestSchema,
      },
    },
    async function (req, reply) {
      if (banners[req.query.banner] === undefined) {
        void reply.status(404);
        throw new Error('banner not found');
      }

      const result = getWishTallyData(req.query.banner);
      if (result === undefined) {
        void reply.status(400);
        throw new Error('data is not available yet');
      }

      return result;
    },
  );

  server.post<{ Body: WishData }>(
    '/wish',
    {
      schema: {
        body: WishDataSchema,
      },
    },
    async function (req, reply) {
      const banner = banners[req.body.banner];
      if (banner === undefined) {
        void reply.status(400);
        throw new Error('invalid banner');
      }

      void pushQueue(req.body);

      return { status: 'queued' };
    },
  );
}
