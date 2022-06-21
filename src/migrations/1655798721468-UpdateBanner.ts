import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banners = {
  characters: {
    name: "Oni's Royale",
    start: '2022-06-21 18:00:00',
    end: '2022-07-12 14:59:59',
    id: 300031,
  },
  weapons: {
    name: 'Epitome Invocation',
    start: '2022-06-21 18:00:00',
    end: '2022-07-12 14:59:59',
    id: 400030,
  },
};

export class UpdateBanner1655798721468 implements MigrationInterface {
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
    await queryRunner.manager.delete(Banner, [300031, 400030]);
  }
}
