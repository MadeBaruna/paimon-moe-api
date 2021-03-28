import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1600000000000 implements MigrationInterface {
  name = 'Init1600000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "wish" (
                "id" SERIAL NOT NULL,
                "uniqueId" character(8) NOT NULL,
                "rarePity" smallint array NOT NULL,
                "total" integer NOT NULL,
                "rare" integer NOT NULL,
                "legendary" integer NOT NULL,
                "bannerId" integer,
                CONSTRAINT "PK_e338d8f62014703650439326d3a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "pull_type_enum" AS ENUM('character', 'weapon')
        `);
    await queryRunner.query(`
            CREATE TABLE "pull" (
                "id" SERIAL NOT NULL,
                "time" TIMESTAMP WITH TIME ZONE NOT NULL,
                "name" character varying NOT NULL,
                "pity" smallint NOT NULL,
                "type" "pull_type_enum" NOT NULL,
                "grouped" boolean NOT NULL,
                "wishId" integer,
                "bannerId" integer,
                CONSTRAINT "PK_d25e988445e4493d39c34db02ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "banner_type_enum" AS ENUM('beginners', 'standard', 'characters', 'weapons')
        `);
    await queryRunner.query(`
            CREATE TABLE "banner" (
                "id" integer NOT NULL,
                "name" character varying NOT NULL,
                "type" "banner_type_enum" NOT NULL,
                "start" TIMESTAMP WITH TIME ZONE NOT NULL,
                "end" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "wish"
            ADD CONSTRAINT "FK_a08ceb3de9d6a132189c413345b" FOREIGN KEY ("bannerId") REFERENCES "banner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pull"
            ADD CONSTRAINT "FK_ca4071ed544867073b1d700ff9c" FOREIGN KEY ("wishId") REFERENCES "wish"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "pull"
            ADD CONSTRAINT "FK_44cfb56ecfa3c8ac09ec5ea2c62" FOREIGN KEY ("bannerId") REFERENCES "banner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "pull" DROP CONSTRAINT "FK_44cfb56ecfa3c8ac09ec5ea2c62"
        `);
    await queryRunner.query(`
            ALTER TABLE "pull" DROP CONSTRAINT "FK_ca4071ed544867073b1d700ff9c"
        `);
    await queryRunner.query(`
            ALTER TABLE "wish" DROP CONSTRAINT "FK_a08ceb3de9d6a132189c413345b"
        `);
    await queryRunner.query(`
            DROP TABLE "banner"
        `);
    await queryRunner.query(`
            DROP TYPE "banner_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "pull"
        `);
    await queryRunner.query(`
            DROP TYPE "pull_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "wish"
        `);
  }
}
