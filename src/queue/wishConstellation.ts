import Queue, { Job } from 'bull';
import XXHash from 'xxhash';
import { getRepository } from 'typeorm';

import { WishConstellationData } from '../types/wishConstellationData';
import { Constellation } from '../entities/constellation';

const queue = new Queue<WishConstellationData>('wish-constellation', process.env.REDIS_URL ?? 'redis://localhost:6379');
const seed = Number(process.env.XXHASH_SEED);
console.log(JSON.stringify({ message: 'wish constellation queue init' }));

async function submitWishTallyConstellation(job: Job<WishConstellationData>): Promise<void> {
  const data = job.data;

  // for identifying same wish, old wishes will be removed first
  const uniqueId = XXHash.hash(Buffer.from(data.uid), seed, 'hex');

  const wishConstellationRepo = getRepository(Constellation);

  const constellations: Constellation[] = [];
  for (const c of data.items) {
    if (!Array.isArray(c)) {
      throw new Error('invalid wish data');
    }

    const [name, count] = c;
    const constellation = wishConstellationRepo.create({
      uniqueId,
      banner: data.banner === undefined ? undefined : { id: data.banner },
      name,
      count,
    });
    constellations.push(constellation);
  }

  await wishConstellationRepo.save(constellations);
}

void queue.process(submitWishTallyConstellation);

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'processing wish tally constellation', id: job.id, data: job.data }));
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed processing wish tally constellation', id: job.id, data: job.data, error }));
  void job.remove();
});

queue.on('error', (error) => {
  console.log(JSON.stringify({ message: 'error when processing wish tally constellation', error }));
});

export default queue;
