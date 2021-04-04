import { MigrationInterface, QueryRunner } from 'typeorm';

export class Reminder1617490627620 implements MigrationInterface {
  name = 'Reminder1617490627620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "reminder_type_enum" AS ENUM('transformer', 'hoyolab')
        `);
    await queryRunner.query(`
            CREATE TABLE "reminder" (
                "id" SERIAL NOT NULL,
                "time" TIMESTAMP WITH TIME ZONE NOT NULL,
                "token" character varying NOT NULL,
                "type" "reminder_type_enum" NOT NULL,
                CONSTRAINT "PK_9ec029d17cb8dece186b9221ede" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "reminder"
        `);
    await queryRunner.query(`
            DROP TYPE "reminder_type_enum"
        `);
  }
}
