import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWishTotalTable1656003714460 implements MigrationInterface {
  name = 'UpdateWishTotalTable1656003714460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "constellation" ("id" SERIAL NOT NULL, "uniqueId" character(8) NOT NULL, "name" character varying NOT NULL, "count" integer NOT NULL, "bannerId" integer, CONSTRAINT "PK_7b576aecb6f93648ca9915e14a5" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "legendaryWinRateOff" double precision');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "rareWinRateOff" double precision');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "legendaryMaxStreak" integer');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "rareMaxStreak" integer');
    await queryRunner.query('ALTER TABLE "constellation" ADD CONSTRAINT "FK_fca1f20d2e365d5381ee368d09e" FOREIGN KEY ("bannerId") REFERENCES "banner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "constellation" DROP CONSTRAINT "FK_fca1f20d2e365d5381ee368d09e"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "rareMaxStreak"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "legendaryMaxStreak"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "rareWinRateOff"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "legendaryWinRateOff"');
    await queryRunner.query('DROP TABLE "constellation"');
  }
}
