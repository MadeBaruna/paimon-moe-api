import { FastifyInstance } from 'fastify';
import HttpErrors from 'http-errors';

import WishDataSchema from '../schemas/wishData.json';
import WishRequestSchema from '../schemas/wishRequest.json';
import WishTotalDataSchema from '../schemas/wishTotalData.json';
import WishSummaryRequestSchema from '../schemas/wishSummaryRequest.json';
import WishSummaryLuckRequestSchema from '../schemas/wishSummaryLuckRequest.json';
import WishConstellationDataSchema from '../schemas/wishConstellationData.json';
import { WishRequest } from '../types/wishRequest';
import { WishData } from '../types/wishData';
import { WishTotalData } from '../types/wishTotalData';
import { WishConstellationData } from '../types/wishConstellationData';

import { banners } from '../data/banners';
import { getWishTallyData } from '../queue/tally';
import wishTallyQueue from '../queue/wish';
import wishTotalQueue from '../queue/wishTotal';
import wishConstellationQueue from '../queue/wishConstellation';
import { tallyCount } from '../stores/counter';
import { authorization } from '../hooks/auth';
import { WishSummaryRequest } from '../types/wishSummaryRequest';
import { WishSummaryLuckRequest } from '../types/wishSummaryLuckRequest';
import { wishSummary, wishSummaryLuck4, wishSummaryLuck5, wishSummaryWinRateOff4, wishSummaryWinRateOff5 } from '../stores/wishSummary';

const LATEST_CHARACTER_BANNER = 300031;
const LATEST_WEAPON_BANNER = 400030;

export default async function (server: FastifyInstance): Promise<void> {
  server.get(
    '/wish/queue',
    {
      preHandler: authorization,
    },
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

      if (tallyCount.added[req.body.banner] === undefined) {
        tallyCount.added[req.body.banner] = 0;
      }
      tallyCount.added[req.body.banner]++;

      return { status: 'queued' };
    },
  );

  server.post<{ Body: WishTotalData }>(
    '/wish/total',
    {
      schema: {
        body: WishTotalDataSchema,
      },
    },
    async function (req, reply) {
      void wishTotalQueue.add(req.body);
      return { status: 'queued' };
    },
  );

  server.post<{ Body: WishConstellationData }>(
    '/wish/constellation',
    {
      schema: {
        body: WishConstellationDataSchema,
      },
    },
    async function (req, reply) {
      void wishConstellationQueue.add(req.body);
      return { status: 'queued' };
    },
  );

  server.get<{ Querystring: WishSummaryRequest }>(
    '/wish/summary',
    {
      schema: {
        querystring: WishSummaryRequestSchema,
      },
    },
    async function (req, reply) {
      if (wishSummary[req.query.banner] === undefined) {
        throw new HttpErrors.NotFound();
      }
      return wishSummary[req.query.banner];
    },
  );

  server.get<{ Querystring: WishSummaryLuckRequest }>(
    '/wish/summary/luck',
    {
      schema: {
        querystring: WishSummaryLuckRequestSchema,
      },
    },
    async function (req, reply) {
      let source = null;
      if (req.query.rarity === 'legendary') {
        source = wishSummaryLuck5;
      } else {
        source = wishSummaryLuck4;
      }

      if (source[req.query.banner] === undefined) {
        throw new HttpErrors.NotFound();
      }
      return source[req.query.banner];
    },
  );

  server.get<{ Querystring: WishSummaryLuckRequest }>(
    '/wish/summary/winrateoff',
    {
      schema: {
        querystring: WishSummaryLuckRequestSchema,
      },
    },
    async function (req, reply) {
      let source = null;
      if (req.query.rarity === 'legendary') {
        source = wishSummaryWinRateOff5;
      } else {
        source = wishSummaryWinRateOff4;
      }

      if (source[req.query.banner] === undefined) {
        throw new HttpErrors.NotFound();
      }
      return source[req.query.banner];
    },
  );
}
