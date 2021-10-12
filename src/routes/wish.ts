import { FastifyInstance } from 'fastify';

import WishDataSchema from '../schemas/wishData.json';
import WishRequestSchema from '../schemas/wishRequest.json';
import { WishRequest } from '../types/wishRequest';
import { WishData } from '../types/wishData';

import { banners } from '../data/banners';
import { getWishTallyData } from '../queue/tally';
import wishTallyQueue from '../queue/wish';
import { tallyCount } from '../stores/counter';

const LATEST_CHARACTER_BANNER = 300020;
const LATEST_WEAPON_BANNER = 400019;

export default async function (server: FastifyInstance): Promise<void> {
  server.get(
    '/wish/queue',
    async function () {
      const queueCount = await wishTallyQueue.getJobCounts();
      const counter = tallyCount;
      return JSON.stringify({ queue: queueCount, counter }, null, 2);
    },
  );

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

      let priority = false;
      if (req.body.banner === LATEST_CHARACTER_BANNER || req.body.banner === LATEST_WEAPON_BANNER) {
        priority = true;
      }

      void wishTallyQueue.add(req.body, { removeOnComplete: true, lifo: priority });

      return { status: 'queued' };
    },
  );
}
