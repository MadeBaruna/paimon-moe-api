import { MigrationInterface, QueryRunner } from 'typeorm';
import { Banner } from '../entities/banner';

const banner = {
  name: 'Ode to the Dawn Breeze',
  start: '2024-03-13 06:00:00',
  end: '2024-04-02 17:59:00',
  id: 500001,
};

export class UpdateBanner1710312547170 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const newBanner = new Banner();
    newBanner.id = banner.id;
    newBanner.type = 'chronicled';
    newBanner.name = banner.name;
    newBanner.start = `${banner.start}+8`;
    newBanner.end = `${banner.end}+8`;

    await queryRunner.manager.save(newBanner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Banner, [500001]);
  }
}
