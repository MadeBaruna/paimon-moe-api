import { FastifyInstance } from 'fastify';
import XXHash from 'xxhash';
import dayjs from 'dayjs';
import memoize from 'nano-memoize';
import { getManager, getRepository } from 'typeorm';

import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

import WishDataSchema from '../schemas/wishData.json';
import WishRequestSchema from '../schemas/wishRequest.json';
import { WishRequest } from '../types/wishRequest';
import { WishData } from '../types/wishData';
import { calculateWishTally } from '../services/wish';

import { banners } from '../data/banners';

const defaultLegendaryRewards = [
  'jean',
  'qiqi',
  'keqing',
  'mona',
  'diluc',
  'skyward_harp',
  'amos_bow',
  'skyward_atlas',
  'lost_prayer_to_the_sacred_winds',
  'skyward_harp',
  'wolfs_gravestone',
  'skyward_spine',
  'primordial_jade_winged-spear',
  'skyward_blade',
  'aquila_favonia',
];

export default async function (server: FastifyInstance): Promise<void> {
  const seed = Number(process.env.XXHASH_SEED);

  // cache wish tally result for 1 hour
  const wishMemoized = memoize(calculateWishTally, {
    maxAge: 3600000,
  });

  server.get<{ Querystring: WishRequest }>(
    '/wish',
    {
      schema: {
        querystring: WishRequestSchema,
      },
    },
    async function (req, reply) {
      try {
        const result = await wishMemoized(req.query.banner);
        return result;
      } catch (error) {
        server.log.error(error);
        void reply.status(400);
        throw new Error('invalid banner');
      }
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

      // for identifying same wish, old wishes will be removed first
      const firstWishes = req.body.firstPulls.map((e) => e.join(';')).join(';');
      const uniqueId = XXHash.hash(Buffer.from(firstWishes), seed, 'hex');

      const pullRepo = getRepository(Pull);

      const pulls: Pull[] = [];
      for (const pull of req.body.legendaryPulls) {
        if (!Array.isArray(pull)) {
          void reply.status(400);
          throw new Error('invalid wish data');
        }

        if (pull[6] === 5 && banner.featured !== undefined) {
          if (
            pull[3] > 90 ||
            ![...banner.featured, ...defaultLegendaryRewards].includes(pull[1])
          ) {
            void reply.status(400);
            throw new Error('invalid wish data');
          }
        }

        pulls.push(
          pullRepo.create({
            time: dayjs.unix(pull[0]).format('YYYY-MM-DD HH:mm:ss'),
            name: pull[1],
            type: pull[2],
            pity: pull[3],
            grouped: pull[4],
            guaranteed: pull[5],
            rarity: pull[6],
            banner: { id: req.body.banner },
          }),
        );
      }

      const wishRepo = getRepository(Wish);

      const savedWish = await wishRepo.findOne({
        where: {
          uniqueId,
          banner: { id: req.body.banner },
        },
      });

      const wish = wishRepo.create({
        banner: { id: req.body.banner },
        uniqueId,
        legendary: req.body.legendary,
        rare: req.body.rare,
        rarePity: req.body.rarePulls,
        total: req.body.total,
        pityCount: req.body.pityCount.slice(0, 90),
        pulls,
      });

      await getManager().transaction(async (transactionalEntityManager) => {
        if (savedWish !== undefined) {
          await transactionalEntityManager.remove(savedWish);
        }
        await transactionalEntityManager.save(wish);
      });

      return { status: 'submitted' };
    },
  );
}
