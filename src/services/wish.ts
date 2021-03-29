import dayjs from 'dayjs';
import { getRepository } from 'typeorm';
import { Banner } from '../entities/banner';
import { Pull } from '../entities/pull';
import { Wish } from '../entities/wish';

export interface WishTallyResult {
  time: string;
  list: Array<{
    name: string;
    type: string;
    count: number;
  }>;
  pityAverage: {
    legendary: number;
    rare: number;
  };
  pityCount: {
    legendary: number[];
    rare: number[];
  };
}

export async function calculateWishTally(id: number): Promise<WishTallyResult> {
  const time = dayjs().format();

  console.log(JSON.stringify({ message: 'generating wish tally', banner: id, time }));

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
    .groupBy('pity')
    .getRawMany<{
    pity: number;
    count: string;
  }>();

  legendaryPityResult.forEach(e => {
    legendaryPity[e.pity] = Number(e.count);
  });

  const legendaryResult = await pullRepo
    .createQueryBuilder('pull')
    .select(['name', 'type', 'COUNT(*) count'])
    .groupBy('name')
    .addGroupBy('type')
    .where({ banner })
    .getRawMany<{
    name: string;
    type: string;
    count: string;
  }>();
  const legendaryItems = legendaryResult.map(e => ({ name: e.name, type: e.type, count: Number(e.count) }));

  const legendaryPityAverage = await pullRepo
    .createQueryBuilder('pull')
    .select('AVG(pity)', 'avg')
    .where({ banner })
    .getRawOne<{ avg: number }>();

  const wishRepo = getRepository(Wish);
  const countPity = [...new Array(10)].map((e, i) => `SUM("rarePity"[${i + 1}]) p${i + 1}`);
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
  const rarePity = Object.entries(rarePityResult).map(([_, val]) => Number(val));
  const rarePityAverage = rarePity.reduce((prev, cur, index) => {
    prev.total += (index + 1) * cur;
    prev.count += cur;
    return prev;
  }, {
    total: 0,
    count: 0,
  });

  const totalPull = await wishRepo
    .createQueryBuilder('wish')
    .select('SUM(total)', 'sum')
    .where({ banner })
    .getRawOne<{ sum: null | string }>();

  const result = {
    time,
    list: legendaryItems,
    pityAverage: {
      legendary: Number(legendaryPityAverage.avg),
      rare: rarePityAverage.count > 0 ? rarePityAverage.total / rarePityAverage.count : 0,
    },
    pityCount: {
      legendary: legendaryPity,
      rare: rarePity,
    },
    total: {
      legendary: legendaryPity.reduce((prev, cur) => (prev + cur), 0),
      rare: rarePity.reduce((prev, cur) => (prev + cur), 0),
      all: totalPull.sum === null ? 0 : Number(totalPull.sum),
    },
  };

  return result;
}
