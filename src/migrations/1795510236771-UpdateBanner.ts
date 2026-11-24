import { MigrationInterface, QueryRunner } from 'typeorm';

import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: 'Harmonious Abundance',
    start: '2026-11-24 18:00:00',
    end: '2026-12-15 14:59:59',
    id: 300109,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2026-07-01 06:00:00',
    end: '2026-07-21 17:59:00',
    id: 400108,
  },
  chronicled: {
    name: 'Names Forged Beneath Blazing Skies',
    start: '2026-11-24 18:00:00',
    end: '2026-12-15 14:59:59',
    id: 500008,
  },
};

export class UpdateBanner1795510236771 implements MigrationInterface {
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

    const newChronicledBanner = banners.chronicled;
    const chronicledBanner = new Banner();
    chronicledBanner.id = newChronicledBanner.id;
    chronicledBanner.type = 'chronicled';
    chronicledBanner.name = newChronicledBanner.name;
    chronicledBanner.start = `${newChronicledBanner.start}+8`;
    chronicledBanner.end = `${newChronicledBanner.end}+8`;

    await queryRunner.manager.save([
      characterBanner,
      weaponBanner,
      chronicledBanner,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [300109, 400108, 500008]);
  }
}
