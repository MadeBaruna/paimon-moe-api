import { MigrationInterface, QueryRunner } from 'typeorm';

export class CounterUpdate1618265878919 implements MigrationInterface {
  name = 'CounterUpdate1618265878919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "counter"
            ADD "digits" character varying NOT NULL DEFAULT ''
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "counter" DROP COLUMN "digits"
        `);
  }
}
