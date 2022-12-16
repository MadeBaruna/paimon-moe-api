import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeckTable1670860250594 implements MigrationInterface {
  name = 'AddDeckTable1670860250594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "deck" ("id" text NOT NULL, "name" text NOT NULL, "deck" json NOT NULL, "views" integer NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_99f8010303acab0edf8e1df24f9" PRIMARY KEY ("id"))');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "deck"');
  }
}
