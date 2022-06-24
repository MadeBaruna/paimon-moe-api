import Queue, { Job } from 'bull';
import XXHash from 'xxhash';
import { getRepository } from 'typeorm';

import { WishTotalData } from '../types/wishTotalData';
import { WishTotal } from '../entities/wishTotal';

const queue = new Queue<WishTotalData>('wish-total', process.env.REDIS_URL ?? 'redis://localhost:6379');
const seed = Number(process.env.XXHASH_SEED);
console.log(JSON.stringify({ message: 'wish total queue init' }));

async function submitWishTallyTotal(job: Job<WishTotalData>): Promise<void> {
  const data = job.data;

  // for identifying same wish, old wishes will be removed first
  const uniqueId = XXHash.hash(Buffer.from(data.uid), seed, 'hex');

  const wishTotalRepo = getRepository(WishTotal);

  const wishTotal = wishTotalRepo.create({
    uniqueId,
    bannerType: data.type,
    total: data.total,
    legendary: data.legendary,
    rare: data.rare,
    legendaryPercentage: data.legendary / data.total,
    rarePercentage: data.rare / data.total,
  });

  if (data.rateOffLegendary !== undefined && data.rateOffRare !== undefined) {
    const { win: w5, lose: l5 } = data.rateOffLegendary;
    wishTotal.legendaryWinRateOff = w5 / (w5 + l5);
    const { win: w4, lose: l4 } = data.rateOffRare;
    wishTotal.rareWinRateOff = w4 / (w4 + l4);

    wishTotal.legendaryMaxStreak = data.rateOffLegendary.maxStreak;
    wishTotal.rareMaxStreak = data.rateOffRare.maxStreak;
  }

  await wishTotalRepo.save(wishTotal);
}

void queue.process(submitWishTallyTotal);

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'processing wish tally total', id: job.id, data: job.data }));
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed processing wish tally total', id: job.id, data: job.data, error }));
  void job.remove();
});

queue.on('error', (error) => {
  console.log(JSON.stringify({ message: 'error when processing wish tally total', error }));
});

export default queue;
