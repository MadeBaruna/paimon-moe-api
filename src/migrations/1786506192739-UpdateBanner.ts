import { MigrationInterface, QueryRunner } from 'typeorm';

import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: "Swan's Shadow in Silken Ice",
    start: '2026-08-12 06:00:00',
    end: '2026-09-01 17:59:00',
    id: 300104,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2026-08-12 06:00:00',
    end: '2026-09-01 17:59:00',
    id: 400103,
  },
};

export class UpdateBanner1786506192739 implements MigrationInterface {
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

    await queryRunner.manager.save([characterBanner, weaponBanner]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [300104, 400103]);
  }
}
