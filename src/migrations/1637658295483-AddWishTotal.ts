import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWishTotal1637658295483 implements MigrationInterface {
  name = 'AddWishTotal1637658295483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "wish_total" ("id" SERIAL NOT NULL, "uniqueId" character(8) NOT NULL, "total" integer NOT NULL, "bannerType" character varying NOT NULL, CONSTRAINT "PK_07b4868e08689019366ade3a35a" PRIMARY KEY ("id"))');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "wish_total"');
  }
}
