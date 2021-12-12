import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWishTotalTable1639306605998 implements MigrationInterface {
  name = 'UpdateWishTotalTable1639306605998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "wish_uniqueId_idx"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP CONSTRAINT "PK_07b4868e08689019366ade3a35a"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "id"');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "legendary" integer NOT NULL');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "rare" integer NOT NULL');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "legendaryPercentage" double precision NOT NULL');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "rarePercentage" double precision NOT NULL');
    await queryRunner.query('ALTER TABLE "wish_total" ADD CONSTRAINT "PK_c89c588c3c1930b8ba690d70328" PRIMARY KEY ("uniqueId", "bannerType")');
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'::smallint[]');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'');
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
    await queryRunner.query('ALTER TABLE "wish_total" DROP CONSTRAINT "PK_c89c588c3c1930b8ba690d70328"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "rarePercentage"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "legendaryPercentage"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "rare"');
    await queryRunner.query('ALTER TABLE "wish_total" DROP COLUMN "legendary"');
    await queryRunner.query('ALTER TABLE "wish_total" ADD "id" SERIAL NOT NULL');
    await queryRunner.query('ALTER TABLE "wish_total" ADD CONSTRAINT "PK_07b4868e08689019366ade3a35a" PRIMARY KEY ("id")');
    await queryRunner.query('CREATE INDEX "wish_uniqueId_idx" ON "wish" ("uniqueId") ');
  }
}
