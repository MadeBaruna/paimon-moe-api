import { MigrationInterface, QueryRunner } from 'typeorm';

export class WishAddPityCount1619561339594 implements MigrationInterface {
  name = 'WishAddPityCount1619561339594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wish"
            ADD "pityCount" smallint array NOT NULL DEFAULT '{}'::smallint []
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "wish" DROP COLUMN "pityCount"
        `);
  }
}
