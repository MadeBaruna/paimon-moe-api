import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';
import { Wish } from '../entities/wish';

const banners = {
  standardReset: {
    name: 'Wanderlust Invocation Old 2',
    start: '1999-12-31 16:00:00',
    end: '2199-12-31 16:00:00',
    id: 200003,
  },
  characters: {
    name: 'Drifting Luminescence',
    start: '2021-09-27 10:00:00',
    end: '2021-10-11 03:59:59',
    id: 300019,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2021-09-27 10:00:00',
    end: '2021-10-11 03:59:59',
    id: 400018,
  },
};

export class UpdateBanner1632211888453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const newCharacterBanner = banners.characters;
    const characterBanner = new Banner();
    characterBanner.id = newCharacterBanner.id;
    characterBanner.type = 'characters';
    characterBanner.name = newCharacterBanner.name;
    characterBanner.start = `${newCharacterBanner.start}+8`;
    characterBanner.end = `${newCharacterBanner.end}+8`;

    const newWeaponBanner = banners.weapons;
    const weaponBanner = new Banner();
    weaponBanner.id = newWeaponBanner.id;
    weaponBanner.type = 'weapons';
    weaponBanner.name = newWeaponBanner.name;
    weaponBanner.start = `${newWeaponBanner.start}+8`;
    weaponBanner.end = `${newWeaponBanner.end}+8`;

    const newStandardResetBanner = banners.standardReset;
    const standardResetBanner = new Banner();
    standardResetBanner.id = newStandardResetBanner.id;
    standardResetBanner.type = 'standard';
    standardResetBanner.name = newStandardResetBanner.name;
    standardResetBanner.start = `${newStandardResetBanner.start}+8`;
    standardResetBanner.end = `${newStandardResetBanner.end}+8`;

    await queryRunner.manager.save([characterBanner, weaponBanner, standardResetBanner]);

    await queryRunner.manager
      .createQueryBuilder()
      .update(Wish)
      .set({ banner: { id: 200003 } })
      .where('bannerId = :id', { id: 200001 })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [300019, 400018]);

    await queryRunner.manager
      .createQueryBuilder()
      .update(Wish)
      .set({ banner: { id: 200001 } })
      .where('bannerId = :id', { id: 200003 })
      .execute();
  }
}
