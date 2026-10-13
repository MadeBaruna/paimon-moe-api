import { MigrationInterface, QueryRunner } from 'typeorm';

import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: "Void Star's Advent",
    start: '2026-10-13 18:00:00',
    end: '2026-11-03 14:59:59',
    id: 300107,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2026-10-13 18:00:00',
    end: '2026-11-03 14:59:59',
    id: 400106,
  },
};

export class UpdateBanner1791878192673 implements MigrationInterface {
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
    await queryRunner.manager.delete(Banner, [300107, 400106]);
  }
}
