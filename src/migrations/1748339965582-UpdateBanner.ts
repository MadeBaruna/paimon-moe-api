import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: 'La Chanson Cerise',
    start: '2025-05-27 18:00:00',
    end: '2025-06-17 14:59:00',
    id: 300083,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2025-05-27 18:00:00',
    end: '2025-06-17 14:59:00',
    id: 400082,
  },
  chronicled: {
    name: 'Thunder Rends the Plains on High',
    start: '2025-05-27 18:00:00',
    end: '2025-06-17 14:59:00',
    id: 500003,
  },
};

export class UpdateBanner1748339965582 implements MigrationInterface {
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
    chronicledBanner.type = 'weapons';
    chronicledBanner.name = newChronicledBanner.name;
    chronicledBanner.start = `${newChronicledBanner.start}+8`;
    chronicledBanner.end = `${newChronicledBanner.end}+8`;

    await queryRunner.manager.save([characterBanner, weaponBanner]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [300083, 400082, 500003]);
  }
}
