import Queue, { Job } from 'bull';
import XXHash from 'xxhash';
import dayjs from 'dayjs';
import { getManager, getRepository } from 'typeorm';

import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

import { banners } from '../data/banners';

import { WishData } from '../types/wishData';
import { tallyCount } from '../stores/counter';

const queue = new Queue('wish', process.env.REDIS_URL ?? 'redis://localhost:6379');
const seed = Number(process.env.XXHASH_SEED);
const concurrency = Number(process.env.TALLY_QUEUE_CONCURRENCY);
console.log(JSON.stringify({ message: 'wish tally queue init', concurrency }));

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
  'skyward_pride',
  'wolfs_gravestone',
  'skyward_spine',
  'primordial_jade_winged-spear',
  'skyward_blade',
  'aquila_favonia',
];

async function submitWishTally(job: Job<WishData>): Promise<void> {
  const data = job.data;
  const banner = banners[data.banner];

  // for identifying same wish, old wishes will be removed first
  const firstWishes = data.firstPulls.map((e) => e.join(';')).join(';');
  const uniqueId = XXHash.hash(Buffer.from(firstWishes), seed, 'hex');
  const uniqueIdUID = XXHash.hash(Buffer.from(data.uid), seed, 'hex');

  const pullRepo = getRepository(Pull);

  const pulls: Pull[] = [];
  for (const pull of data.legendaryPulls) {
    if (!Array.isArray(pull)) {
      throw new Error('invalid wish data');
    }

    if (pull[6] === 5) {
      if (pull[3] <= 90) {
        if (banner.featured !== undefined) {
          if (
            ![...banner.featured, ...defaultLegendaryRewards].includes(pull[1])
          ) {
            throw new Error('invalid wish data');
          }
        } else {
          if (
            !defaultLegendaryRewards.includes(pull[1])
          ) {
            throw new Error('invalid wish data');
          }
        }
      } else {
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
        banner: { id: data.banner },
      }),
    );
  }

  const wishRepo = getRepository(Wish);

  const savedWish = await wishRepo.findOne({
    where: { uniqueId, banner: { id: data.banner } },
  });

  const savedWishUID = await wishRepo.findOne({
    where: { uniqueId: uniqueIdUID, banner: { id: data.banner } },
  });

  await getManager().transaction(async (transactionalEntityManager) => {
    if (savedWish !== undefined) {
      await transactionalEntityManager.remove(savedWish);
    }

    if (savedWishUID !== undefined) {
      // delete old pulls first
      await transactionalEntityManager.delete(Pull, {
        wish: {
          id: savedWishUID.id,
        },
        banner: {
          id: data.banner,
        },
      });

      savedWishUID.uniqueId = uniqueIdUID;
      savedWishUID.legendary = data.legendary;
      savedWishUID.rare = data.rare;
      savedWishUID.rarePity = data.rarePulls;
      savedWishUID.total = data.total;
      savedWishUID.pityCount = data.pityCount.slice(0, 90);
      savedWishUID.pulls = pulls;
      await transactionalEntityManager.save(savedWishUID);
    } else {
      const newWish = wishRepo.create({
        banner: { id: data.banner },
        uniqueId: uniqueIdUID,
        legendary: data.legendary,
        rare: data.rare,
        rarePity: data.rarePulls,
        total: data.total,
        pityCount: data.pityCount.slice(0, 90),
        pulls,
      });
      await transactionalEntityManager.save(newWish);
    }
  });

  if (tallyCount.finished[data.banner] === undefined) {
    tallyCount.finished[data.banner] = 0;
  }
  tallyCount.finished[data.banner]++;
}

void queue.process(concurrency, submitWishTally);

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'processing wish tally', id: job.id, banner: job.data.banner }));
});

queue.on('failed', (job) => {
  console.log(JSON.stringify({ message: 'failed processing wish tally', id: job.id, data: job.data, error: job.stacktrace }));
  void job.remove();
});

queue.on('error', (error) => {
  console.log(JSON.stringify({ message: 'error when processing wish tally', error }));
});

export default queue;
