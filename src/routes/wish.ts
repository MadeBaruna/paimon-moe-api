import { FastifyInstance } from 'fastify';
import XXHash from 'xxhash';
import dayjs from 'dayjs';
import memoize from 'nano-memoize';
import { getManager, getRepository } from 'typeorm';

import { Banner } from '../entities/banner';
import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

import WishDataSchema from '../schemas/wishData.json';
import WishRequestSchema from '../schemas/wishRequest.json';
import { WishRequest } from '../types/wishRequest';
import { WishData } from '../types/wishData';
import { calculateWishTally } from '../services/wish';
import { Counter } from '../entities/counter';

export default async function (server: FastifyInstance): Promise<void> {
  const seed = Number(process.env.XXHASH_SEED);

  // cache wish tally result for 1 hour
  const wishMemoized = memoize(calculateWishTally, {
    maxAge: 3600000,
  });

  server.get<{ Querystring: WishRequest }>('/wish', {
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
  });

  server.post<{ Body: WishData }>('/wish', {
    schema: {
      body: WishDataSchema,
    },
  },
  async function (req, reply) {
    const bannerRepo = getRepository(Banner);

    let banner;
    try {
      banner = await bannerRepo.findOneOrFail({ id: req.body.banner });
    } catch (error) {
      server.log.error(error);
      void reply.status(400);
      throw new Error('invalid banner');
    }

    // for identifying same wish, old wishes will be removed first
    const firstWishes = req.body.firstPulls.map(e => e.join(';')).join(';');
    const uniqueId = XXHash.hash(Buffer.from(firstWishes), seed, 'hex');

    const pullRepo = getRepository(Pull);

    const pulls: Pull[] = [];
    for (const pull of req.body.legendaryPulls) {
      if (!Array.isArray(pull)) {
        void reply.status(400);
        throw new Error('invalid wish data');
      }

      pulls.push(pullRepo.create({
        time: dayjs.unix(pull[0]).format('YYYY-MM-DD HH:mm:ss+8'),
        name: pull[1],
        type: pull[2],
        pity: pull[3],
        grouped: pull[4],
        guaranteed: pull[5],
        rarity: pull[6],
        banner,
      }));
    }

    const wishRepo = getRepository(Wish);

    const savedWish = await wishRepo.findOne({
      where: {
        uniqueId,
        banner,
      },
    });

    const wish = wishRepo.create({
      banner,
      uniqueId,
      legendary: req.body.legendary,
      rare: req.body.rare,
      rarePity: req.body.rarePulls,
      total: req.body.total,
      pulls,
    });

    await getManager().transaction(async transactionalEntityManager => {
      if (savedWish !== undefined) {
        await transactionalEntityManager.remove(savedWish);
      }
      await transactionalEntityManager.save(wish);
    });

    if (req.body.lastPull != null) {
      const counterRepo = getRepository(Counter);

      const lastPull = req.body.lastPull;
      const lastTime = dayjs(lastPull.time);

      const range = {
        start: lastTime.minute(0).second(0).format('YYYY-MM-DD HH:mm:ssZ'),
        end: lastTime.minute(59).second(59).format('YYYY-MM-DD HH:mm:ssZ'),
      };

      try {
        const current = await counterRepo
          .createQueryBuilder('counter')
          .where('time >= :start', { start: range.start })
          .andWhere('time <= :end', { end: range.end })
          .getOne();

        if (current !== undefined) {
          if (current.lastId < lastPull.id) {
            current.time = lastTime.format('YYYY-MM-DD HH:mm:ss+8');
            current.lastId = lastPull.id;
            await counterRepo.save(current);
          }
        } else {
          const newCurrent = counterRepo.create({
            lastId: lastPull.id,
            time: lastTime.format('YYYY-MM-DD HH:mm:ss+8'),
          });
          await counterRepo.save(newCurrent);
        }
      } catch (err) {
        server.log.error(err);
      }
    }

    return { status: 'submitted' };
  });
}
