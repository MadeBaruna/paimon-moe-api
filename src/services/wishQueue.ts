import XXHash from 'xxhash';
import dayjs from 'dayjs';
import { getManager, getRepository } from 'typeorm';

import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

import { banners } from '../data/banners';

import { WishData } from '../types/wishData';

const seed = Number(process.env.XXHASH_SEED);

const queue: WishData[] = [];
let isProcessing = false;

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

export async function pushQueue(data?: WishData): Promise<void> {
  if (data !== undefined) {
    queue.push(data);
  }

  if (isProcessing) {
    return;
  }

  isProcessing = true;
  while (true) {
    const current = queue.shift();
    if (current === undefined) {
      console.log(JSON.stringify({ message: 'wish tally queue finished' }));
      isProcessing = false;
      return;
    }

    console.log(JSON.stringify({ message: 'processing wish tally queue', length: queue.length }));

    try {
      await processQueue(current);
    } catch (err) { }
  }
}

async function processQueue(data: WishData): Promise<void> {
  const banner = banners[data.banner];

  // for identifying same wish, old wishes will be removed first
  const firstWishes = data.firstPulls.map((e) => e.join(';')).join(';');
  const uniqueId = XXHash.hash(Buffer.from(firstWishes), seed, 'hex');

  const pullRepo = getRepository(Pull);

  const pulls: Pull[] = [];
  for (const pull of data.legendaryPulls) {
    if (!Array.isArray(pull)) {
      throw new Error('invalid wish data');
    }

    if (pull[6] === 5 && banner.featured !== undefined) {
      if (
        pull[3] > 90 ||
        ![...banner.featured, ...defaultLegendaryRewards].includes(pull[1])
      ) {
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
    where: {
      uniqueId,
      banner: { id: data.banner },
    },
  });

  const wish = wishRepo.create({
    banner: { id: data.banner },
    uniqueId,
    legendary: data.legendary,
    rare: data.rare,
    rarePity: data.rarePulls,
    total: data.total,
    pityCount: data.pityCount.slice(0, 90),
    pulls,
  });

  await getManager().transaction(async (transactionalEntityManager) => {
    if (savedWish !== undefined) {
      await transactionalEntityManager.remove(savedWish);
    }
    await transactionalEntityManager.save(wish);
  });
}
