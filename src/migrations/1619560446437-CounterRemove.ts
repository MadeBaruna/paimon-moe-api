import { MigrationInterface, QueryRunner } from 'typeorm';

export class CounterRemove1619560446437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "counter"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}
