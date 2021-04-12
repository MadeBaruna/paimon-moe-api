import { MigrationInterface, QueryRunner } from 'typeorm';

export class CounterUpdate1618255343174 implements MigrationInterface {
  name = 'CounterUpdate1618255343174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "counter" (
                "id" SERIAL NOT NULL,
                "time" TIMESTAMP WITH TIME ZONE NOT NULL,
                "lastId" character varying NOT NULL,
                CONSTRAINT "PK_012f437b30fcf5a172841392ef3" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "counter"
        `);
  }
}
