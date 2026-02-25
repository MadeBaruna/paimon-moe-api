import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: "The Northerly Wind's Song of Triumph",
    start: '2026-02-25 06:00:00',
    end: '2026-03-07 17:59:00',
    id: 300096,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2026-02-25 06:00:00',
    end: '2026-03-07 17:59:00',
    id: 400095,
  },
  chronicled: {
    name: 'Ode to the Dawn Breeze',
    start: '2026-02-25 06:00:00',
    end: '2026-03-07 17:59:00',
    id: 500005,
  },
};

export class UpdateBanner1771986660487 implements MigrationInterface {
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
    await queryRunner.manager.delete(Banner, [300096, 400095, 500005]);
  }
}
