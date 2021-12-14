import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWishTable1639479153280 implements MigrationInterface {
  name = 'UpdateWishTable1639479153280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'::smallint[]');
    await queryRunner.query('CREATE INDEX "IDX_ee3316fbc44c8eaeb087239485" ON "wish" ("uniqueId") ');
    await queryRunner.query('CREATE INDEX "IDX_pullwishid" ON "pull" ("wishId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_pullwishid"');
    await queryRunner.query('DROP INDEX "IDX_ee3316fbc44c8eaeb087239485"');
    await queryRunner.query('ALTER TABLE "wish" ALTER COLUMN "pityCount" SET DEFAULT \'{}\'');
    await queryRunner.query('COMMENT ON COLUMN "wish"."pityCount" IS NULL');
  }
}
