import Queue, { Job } from 'bull';
import { getRepository } from 'typeorm';
import { WishTotal } from '../entities/wishTotal';
import { wishSummary } from '../stores/wishSummary';

const queue = new Queue<string>('wish-summary', process.env.REDIS_URL ?? 'redis://localhost:6379');
console.log(JSON.stringify({ message: 'wish summary queue init' }));

async function calculateWishSummary(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['total', 'count(*) count'])
    .where({ bannerType })
    .addGroupBy('total')
    .getRawMany<{
    total: number;
    count: string;
  }>();

  wishSummary[bannerType] = counts.map(({ total, count }) => [total, Number(count)]);
}

const types = ['standard', 'character-event', 'weapon-event'];
async function checkWishSummary(job: Job): Promise<void> {
  for (const type of types) {
    void queue.add('wish-summary-calculate', type);
  }
}

void queue.process('wish-summary-check', 0, checkWishSummary);
void queue.process('wish-summary-calculate', 1, calculateWishSummary);

void queue.add('wish-summary-check');
void queue.add('wish-summary-check', { repeat: { cron: '30 * * * *' } });

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'processing wish summary', id: job.id, data: job.data }));
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed processing wish summary', id: job.id, data: job.data, error }));
  void job.remove();
});

queue.on('error', (error) => {
  console.log(JSON.stringify({ message: 'error when processing wish summary', error }));
});

export default queue;
