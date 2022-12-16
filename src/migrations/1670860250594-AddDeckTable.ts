import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeckTable1670860250594 implements MigrationInterface {
  name = 'AddDeckTable1670860250594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "deck" ("id" text NOT NULL, "name" text NOT NULL, "deck" json NOT NULL, "views" integer NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_99f8010303acab0edf8e1df24f9" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "reminder" ("id" SERIAL NOT NULL, "time" TIMESTAMP WITH TIME ZONE NOT NULL, "token" character varying NOT NULL, "type" "reminder_type_enum" NOT NULL, CONSTRAINT "PK_9ec029d17cb8dece186b9221ede" PRIMARY KEY ("id"))');
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'::smallint[]');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'');
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
    await queryRunner.query('DROP TABLE "reminder"');
    await queryRunner.query('DROP TABLE "deck"');
  }
}
