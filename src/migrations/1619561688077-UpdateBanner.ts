import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';
import { Wish } from '../entities/wish';

const banners = {
  standardReset: {
    name: 'Wanderlust Invocation Old',
    start: '1999-12-31 16:00:00',
    end: '2199-12-31 16:00:00',
    id: 200002,
  },
  characters: {
    name: 'Gentry of Hermitage',
    start: '2021-04-28 06:00:00',
    end: '2021-05-18 17:59:59',
    id: 300012,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2021-04-28 06:00:00',
    end: '2021-05-18 17:59:59',
    id: 400011,
  },
};

export class UpdateBanner1619561688077 implements MigrationInterface {
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
      .set({ banner: { id: 200002 } })
      .where('bannerId = :id', { id: 200001 })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [200002, 300012, 400011]);

    await queryRunner.manager
      .createQueryBuilder()
      .update(Wish)
      .set({ banner: { id: 200001 } })
      .where('bannerId = :id', { id: 200002 })
      .execute();
  }
}
