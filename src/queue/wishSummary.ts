import Queue, { Job } from 'bull';
import { getRepository } from 'typeorm';
import { WishTotal } from '../entities/wishTotal';
import { wishSummary, wishSummaryLuck5, wishSummaryLuck4, wishSummaryWinRateOff5, wishSummaryWinRateOff4 } from '../stores/wishSummary';

const queue = new Queue<string>('wish-summary', process.env.REDIS_URL ?? 'redis://localhost:6379');
console.log(JSON.stringify({ message: 'wish summary queue init' }));

async function calculateWishSummary(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['total', 'count(*) count'])
    .where({ bannerType })
    .andWhere('legendary > 0')
    .addGroupBy('total')
    .getRawMany<{
    total: number;
    count: string;
  }>();

  wishSummary[bannerType] = counts.map(({ total, count }) => [total, Number(count)]);
}

async function calculateWishSummaryLuckLegendary(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['trunc("legendaryPercentage"::numeric, 4) percentage', 'count(*) count'])
    .where({ bannerType })
    .andWhere('legendary > 3')
    .andWhere('"legendaryPercentage" != \'Infinity\'')
    .addGroupBy('percentage')
    .orderBy('percentage')
    .getRawMany<{
    percentage: number;
    count: string;
  }>();

  wishSummaryLuck5[bannerType] = counts.map(({ percentage, count }) => [Number(percentage), Number(count)]);
}

async function calculateWishSummaryLuckRare(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['trunc("rarePercentage"::numeric, 4) percentage', 'count(*) count'])
    .where({ bannerType })
    .andWhere('rare > 7')
    .andWhere('"rarePercentage" != \'Infinity\'')
    .addGroupBy('percentage')
    .orderBy('percentage')
    .getRawMany<{
    percentage: number;
    count: string;
  }>();

  wishSummaryLuck4[bannerType] = counts.map(({ percentage, count }) => [Number(percentage), Number(count)]);
}

async function calculateWishSummaryWinRateOffLegendary(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['trunc("legendaryWinRateOff"::numeric, 4) percentage', 'count(*) count'])
    .where({ bannerType })
    .andWhere('legendary > 3')
    .andWhere('"legendaryWinRateOff" IS NOT NULL')
    .andWhere('"legendaryWinRateOff" != \'NaN\'')
    .addGroupBy('percentage')
    .orderBy('percentage')
    .getRawMany<{
    percentage: number;
    count: string;
  }>();

  wishSummaryWinRateOff5[bannerType] = counts.map(({ percentage, count }) => [Number(percentage), Number(count)]);
}

async function calculateWishSummaryWinRateOffRare(job: Job<string>): Promise<void> {
  const bannerType = job.data;

  const wishTotalRepo = getRepository(WishTotal);
  const counts = await wishTotalRepo
    .createQueryBuilder()
    .select(['trunc("rareWinRateOff"::numeric, 4) percentage', 'count(*) count'])
    .where({ bannerType })
    .andWhere('rare > 7')
    .andWhere('"rareWinRateOff" IS NOT NULL')
    .andWhere('"rareWinRateOff" != \'NaN\'')
    .addGroupBy('percentage')
    .orderBy('percentage')
    .getRawMany<{
    percentage: number;
    count: string;
  }>();

  wishSummaryWinRateOff4[bannerType] = counts.map(({ percentage, count }) => [Number(percentage), Number(count)]);
}

const types = ['standard', 'character-event', 'weapon-event'];
async function checkWishSummary(job: Job): Promise<void> {
  for (const type of types) {
    void queue.add('wish-summary-calculate', type);
    void queue.add('wish-summary-calculate-luck5', type);
    void queue.add('wish-summary-calculate-luck4', type);
    if (type !== 'standard') {
      void queue.add('wish-summary-calculate-winrateoff5', type);
      void queue.add('wish-summary-calculate-winrateoff4', type);
    }
  }
}

void queue.process('wish-summary-check', 0, checkWishSummary);
void queue.process('wish-summary-calculate', 1, calculateWishSummary);
void queue.process('wish-summary-calculate-luck5', 1, calculateWishSummaryLuckLegendary);
void queue.process('wish-summary-calculate-luck4', 1, calculateWishSummaryLuckRare);
void queue.process('wish-summary-calculate-winrateoff5', 1, calculateWishSummaryWinRateOffLegendary);
void queue.process('wish-summary-calculate-winrateoff4', 1, calculateWishSummaryWinRateOffRare);

void queue.add('wish-summary-check');
void queue.add('wish-summary-check', { repeat: { cron: '30 * * * *' } });

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'processing wish summary', name: job.name, id: job.id, data: job.data }));
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed processing wish summary', name: job.name, id: job.id, data: job.data, error }));
  void job.remove();
});

queue.on('error', (error) => {
  console.log(JSON.stringify({ message: 'error when processing wish summary', error }));
});

export default queue;
