import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: 'In the Name of the Rosula',
    start: '2023-12-20 06:00:00',
    end: '2024-01-09 17:59:59',
    id: 300058,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2023-12-20 06:00:00',
    end: '2024-01-09 17:59:59',
    id: 400057,
  },
};

export class UpdateBanner1703042162817 implements MigrationInterface {
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
    await queryRunner.manager.delete(Banner, [300058, 400057]);
  }
}
