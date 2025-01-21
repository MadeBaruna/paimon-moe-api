import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: "The Hearth's Ashen Shadow",
    start: '2025-01-21 18:00:00',
    end: '2025-02-11 14:59:00',
    id: 300077,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2025-01-21 18:00:00',
    end: '2025-02-11 14:59:00',
    id: 400076,
  },
  chronicled: {
    name: 'Ode to the Dawn Breeze',
    start: '2024-03-13 06:00:00',
    end: '2024-04-02 17:59:00',
    id: 500002,
  },
};

export class UpdateBanner1737460789582 implements MigrationInterface {
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

    await queryRunner.manager.save([characterBanner, weaponBanner, chronicledBanner]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [300077, 400076, 500002]);
  }
}
