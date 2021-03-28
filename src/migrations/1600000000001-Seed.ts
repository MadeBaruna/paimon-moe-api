import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner, BannerType } from '../entities/banner';

const banners = {
  beginners: [
    {
      name: "Beginners' Wish",
      start: '2000-01-01 00:00:00',
      end: '2200-01-01 00:00:00',
    },
  ],
  standard: [
    {
      name: 'Wanderlust Invocation',
      start: '2000-01-01 00:00:00',
      end: '2200-01-01 00:00:00',
    },
  ],
  characters: [
    {
      name: 'Ballad in Goblets',
      start: '2020-09-28 00:00:00',
      end: '2020-10-18 18:00:00',
    },
    {
      name: 'Sparkling Steps',
      start: '2020-10-20 18:00:00',
      end: '2020-11-10 16:00:00',
    },
    {
      name: 'Farewell of Snezhnaya',
      start: '2020-11-11 06:00:00',
      end: '2020-12-01 16:00:00',
    },
    {
      name: 'Gentry of Hermitage',
      start: '2020-12-01 18:00:00',
      end: '2020-12-22 15:00:00',
    },
    {
      name: 'Secretum Secretorum',
      start: '2020-12-23 06:00:00',
      end: '2021-01-12 16:00:00',
    },
    {
      name: 'Adrift in the Harbor',
      start: '2021-01-12 18:00:00',
      end: '2021-02-02 15:00:00',
    },
    {
      name: 'Invitation to Mundane Life',
      start: '2021-02-03 06:00:00',
      end: '2021-02-17 16:00:00',
    },
    {
      name: 'Dance of Lanterns',
      start: '2021-02-17 18:00:00',
      end: '2021-03-02 16:00:00',
    },
    {
      name: 'Moment of Bloom',
      start: '2021-03-02 18:00:00',
      end: '2021-03-16 15:00:00',
    },
    {
      name: 'Ballad in Goblets',
      start: '2021-03-17 06:00:00',
      end: '2021-04-06 16:00:00',
    },
  ],
  weapons: [
    {
      name: 'Epitome Invocation',
      start: '2020-09-28 00:00:00',
      end: '2020-10-18 18:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2020-10-20 18:00:00',
      end: '2020-11-10 16:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2020-11-11 06:00:00',
      end: '2020-12-01 16:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2020-12-01 18:00:00',
      end: '2020-12-22 15:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2020-12-23 06:00:00',
      end: '2021-01-12 16:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2021-01-12 18:00:00',
      end: '2021-02-02 15:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2021-02-03 06:00:00',
      end: '2021-02-23 16:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2021-02-23 18:00:00',
      end: '2021-03-16 15:00:00',
    },
    {
      name: 'Epitome Invocation',
      start: '2021-03-17 06:00:00',
      end: '2021-04-06 16:00:00',
    },
  ],
};

export class Seed1600000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let id = 1;
    let prefix = 100000;
    const insertData = [];
    for (const [type, bannerList] of Object.entries(banners)) {
      for (const banner of bannerList) {
        const currentBanner = new Banner();
        currentBanner.id = prefix + id;
        currentBanner.type = type as BannerType;
        currentBanner.name = banner.name;
        currentBanner.start = `${banner.start}+8`;
        currentBanner.end = `${banner.end}+8`;

        insertData.push(currentBanner);

        id++;
      }

      id = 1;
      prefix += 100000;
    }

    await queryRunner.manager.save(insertData);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('banner');
  }
}
