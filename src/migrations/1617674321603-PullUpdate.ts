import { MigrationInterface, QueryRunner } from 'typeorm';

export class PullUpdate1617674321603 implements MigrationInterface {
  name = 'PullUpdate1617674321603';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "pull"
            ADD "guaranteed" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "pull"
            ADD "rarity" smallint NOT NULL DEFAULT '5'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "pull" DROP COLUMN "rarity"
        `);
    await queryRunner.query(`
            ALTER TABLE "pull" DROP COLUMN "guaranteed"
        `);
  }
}
