import Queue, { Job } from 'bull';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { getManager, getRepository, MoreThan } from 'typeorm';
import { banners } from '../data/banners';
import { Banner } from '../entities/banner';
import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

dayjs.extend(isBetween);

const queue = new Queue('wish-tally', process.env.REDIS_URL ?? 'redis://localhost:6379');
console.log(JSON.stringify({ message: 'wish tally summary queue init' }));

export interface WishTallyResult {
  time: string;
  list: Array<{
    name: string;
    type: string;
    count: number;
    guaranteed: number;
  }>;
  pityAverage: {
    legendary: number;
    rare: number;
  };
  pityCount: {
    legendary: number[];
    rare: number[];
  };
  constellation: { [key: string]: number[] };
}

const calculated: { [key: number]: WishTallyResult } = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function calculateWishTally(job: Job<number>): Promise<void> {
  const id = job.data;
  const time = dayjs().format();
  const bannerRepo = getRepository(Banner);

  let banner;
  try {
    banner = await bannerRepo.findOneOrFail({ id });
  } catch (error) {
    throw new Error('invalid banner');
  }

  const pullRepo = getRepository(Pull);

  const legendaryPity: number[] = new Array(101).fill(0);
  const legendaryPityResult = await pullRepo
    .createQueryBuilder('pull')
    .select(['pity', 'COUNT(*) count'])
    .where({ banner })
    .andWhere('rarity = 5')
    .groupBy('pity')
    .getRawMany<{
    pity: number;
    count: string;
  }>();

  legendaryPityResult.forEach((e) => {
    legendaryPity[e.pity] = Number(e.count);
  });

  const legendaryResult = await pullRepo
    .createQueryBuilder('pull')
    .select(['name', 'type', 'guaranteed', 'COUNT(*) count'])
    .groupBy('name')
    .addGroupBy('type')
    .addGroupBy('guaranteed')
    .where({ banner })
    .getRawMany<{
    name: string;
    type: string;
    guaranteed: boolean;
    count: string;
  }>();
  const _legendaryResult: {
    [key: string]: {
      name: string;
      type: string;
      guaranteed: number;
      count: number;
    };
  } = {};
  for (const e of legendaryResult) {
    if (_legendaryResult[e.name] === undefined) {
      _legendaryResult[e.name] = {
        name: '',
        type: '',
        guaranteed: 0,
        count: 0,
      };
    }

    _legendaryResult[e.name] = {
      name: e.name,
      type: e.type,
      count: _legendaryResult[e.name].count + Number(e.count),
      guaranteed: e.guaranteed
        ? Number(e.count)
        : _legendaryResult[e.name].guaranteed,
    };
  }
  const legendaryItems = Object.entries(_legendaryResult).map((e) => e[1]);

  const legendaryPityAverage = await pullRepo
    .createQueryBuilder('pull')
    .select([
      'AVG(pity) avg',
      'percentile_disc(0.5) WITHIN GROUP (ORDER BY pity) median',
    ])
    .where({ banner })
    .andWhere('rarity = 5')
    .getRawOne<{ avg: string; median: string }>();

  const wishRepo = getRepository(Wish);
  const countPity = [...new Array(10)].map(
    (e, i) => `SUM("rarePity"[${i + 1}]) p${i + 1}`,
  );
  const rarePityResult = await wishRepo
    .createQueryBuilder('wish')
    .select(countPity)
    .where({ banner })
    .getRawOne<{
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
    p6: number;
    p7: number;
    p8: number;
    p9: number;
    p10: number;
  }>();
  const rarePity = Object.entries(rarePityResult).map(([_, val]) =>
    Number(val),
  );
  const rarePityAverage = rarePity.reduce(
    (prev, cur, index) => {
      prev.total += (index + 1) * cur;
      prev.count += cur;
      return prev;
    },
    {
      total: 0,
      count: 0,
    },
  );

  const totalPull = await wishRepo
    .createQueryBuilder('wish')
    .select(['SUM(total) sum', 'COUNT(*) count'])
    .where({ banner })
    .getRawOne<{ sum: null | string; count: null | string }>();
  const totalPullRare = await pullRepo
    .createQueryBuilder('pull')
    .select('COUNT(*) sum')
    .where({ banner, rarity: 4 })
    .getRawOne<{ sum: null | string }>();

  // new pity total banner >= 300012 and banner >= 400011
  let countEachPity: number[] = [];
  if ((id >= 300012 && id < 400000) || id >= 400011 || id === 200001) {
    const invalidPulls = await pullRepo.find({
      where: {
        pity: MoreThan(90),
        banner,
      },
      relations: ['wish'],
    });

    for (const pull of invalidPulls) {
      await wishRepo.delete(pull.wish);
    }

    const pityCountTotal = [...new Array(90)].map(
      (e, i) => `SUM("pityCount"[${i + 1}]) p${i + 1}`,
    );
    const pityCountResult = await wishRepo
      .createQueryBuilder('wish')
      .select(pityCountTotal)
      .where({ banner })
      .andWhere('legendary > 0')
      .getRawOne<{ [key: string]: number }>();
    countEachPity = Object.entries(pityCountResult).map(([_, val]) =>
      Number(val),
    );
  }

  const pullByDayData = await pullRepo.createQueryBuilder()
    .select(["date_trunc('day', time) \"day\"", 'pity', 'count(*) total'])
    .where({ banner })
    .andWhere('rarity = 4')
    .groupBy('day')
    .addGroupBy('pity')
    .orderBy('day')
    .getRawMany<{ day: string; pity: number; total: number }>();
  const bannerStart = dayjs(banners[id].start);
  const bannerEnd = dayjs(banners[id].end);
  const pullByDay: Array<{ day: string; total: number }> = [];
  let pullByDayTotal = 0;
  let lastDate = '';
  for (const pull of pullByDayData) {
    const current = dayjs(pull.day);
    if (!current.isBetween(bannerStart, bannerEnd, 'day', '[]')) continue;

    const date = current.format('YYYY-MM-DD');
    if (lastDate !== date) {
      pullByDay.push({
        day: pull.day,
        total: 0,
      });
      lastDate = date;
    }

    pullByDay[pullByDay.length - 1].total += pull.pity * pull.total;
    pullByDayTotal += pull.pity * pull.total;
  }

  const pullByDayPercentage = pullByDay.map(e => ({ day: e.day, percentage: e.total / pullByDayTotal }));

  // calculate const list
  const constData = await getManager().createQueryBuilder()
    .select(['name', 'count cons', 'sum(count) total'])
    .from((subQuery) => {
      return subQuery.select(['"wishId"', 'name', 'count(*) count'])
        .from(Pull, 'pull')
        .where('"bannerId" = :bid', { bid: id })
        .groupBy('"wishId"')
        .addGroupBy('name')
        .orderBy('name')
        .addOrderBy('count');
    }, 'sub')
    .groupBy('name')
    .addGroupBy('cons')
    .getRawMany<{ name: string; cons: number; total: string }>();

  let curName = '';
  let curTotal = 0;
  const constFinal: { [key: string]: number[] } = {};
  for (const { name, cons, total } of constData) {
    if (curName !== name) {
      if (curName !== '') {
        for (let index = 0; index < constFinal[curName].length; index++) {
          if (constFinal[curName][index] === undefined) {
            constFinal[curName][index] = 0;
          }
        }

        if (curTotal !== 0) {
          constFinal[curName][7] = curTotal;
          curTotal = 0;
        }
      }

      constFinal[name] = [];
    }

    curName = name;
    if (cons - 1 > 6) {
      curTotal += Number(total);
      continue;
    }

    constFinal[curName][cons - 1] = Number(total);
  }

  if (curTotal !== 0) {
    constFinal[curName][7] = curTotal;
    curTotal = 0;
  }

  const result = {
    time,
    list: legendaryItems,
    pityAverage: {
      legendary: Number(legendaryPityAverage.avg),
      rare:
        rarePityAverage.count > 0
          ? rarePityAverage.total / rarePityAverage.count
          : 0,
    },
    median: {
      legendary: Number(legendaryPityAverage.median),
    },
    pityCount: {
      legendary: legendaryPity,
      rare: rarePity,
    },
    total: {
      legendary: legendaryPity.reduce((prev, cur) => prev + cur, 0),
      rare: totalPullRare.sum === null ? 0 : Number(totalPullRare.sum),
      all: totalPull.sum === null ? 0 : Number(totalPull.sum),
      users: totalPull.count === null ? 0 : Number(totalPull.count),
    },
    countEachPity,
    pullByDay: pullByDayPercentage,
    constellation: constFinal,
  };

  calculated[id] = result;
}

const LATEST_CHARACTER_BANNER = 300077;
const LATEST_WEAPON_BANNER = 400076;
const LATEST_CHRONICLED_BANNER = 500001;
const TOTAL_BANNER = LATEST_CHARACTER_BANNER - 300009;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkWishTally(job: Job<number>): Promise<void> {
  for (let i = 0; i < 2; i++) {
    void queue.add('wish-tally-calculate', LATEST_CHARACTER_BANNER - i);
    void queue.add('wish-tally-calculate', LATEST_WEAPON_BANNER - i);
  }
  void queue.add('wish-tally-calculate', LATEST_CHRONICLED_BANNER);
}

void queue.process('wish-tally-check', 0, checkWishTally);
void queue.process('wish-tally-calculate', 1, calculateWishTally);

void queue.add('wish-tally-calculate', LATEST_CHARACTER_BANNER);
void queue.add('wish-tally-calculate', LATEST_WEAPON_BANNER);
void queue.add('wish-tally-calculate', LATEST_CHRONICLED_BANNER);
for (let i = 0; i <= TOTAL_BANNER; i++) {
  void queue.add('wish-tally-calculate', LATEST_CHARACTER_BANNER - i);
  void queue.add('wish-tally-calculate', LATEST_WEAPON_BANNER - i);
}
void queue.add('wish-tally-calculate', 200001);
void queue.add('wish-tally-check', 1, { repeat: { cron: '0 */2 * * *' } });

queue.on('active', (job) => {
  const time = dayjs().format();
  console.log(JSON.stringify({ message: 'processing wish tally summary', name: job.name, id: job.data, time }));
});

queue.on('completed', (job) => {
  const time = dayjs().format();
  console.log(JSON.stringify({ message: 'finished processing wish tally summary', name: job.name, id: job.data, time }));
  void job.remove();
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed processing wish tally summary', name: job.name, id: job.data }));
  console.error(error);
  void job.remove();
});

export function getWishTallyData(id: number): WishTallyResult | undefined {
  return calculated[id];
}
