import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBannerType1710312104956 implements MigrationInterface {
  name = 'UpdateBannerType1710312104956';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE banner_type_enum ADD VALUE \'chronicled\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "banner_type_enum_old" AS ENUM(\'beginners\', \'standard\', \'characters\', \'weapons\')');
    await queryRunner.query('ALTER TABLE "banner" ALTER COLUMN "type" TYPE "banner_type_enum_old" USING "type"::"text"::"banner_type_enum_old"');
    await queryRunner.query('DROP TYPE "banner_type_enum"');
    await queryRunner.query('ALTER TYPE "banner_type_enum_old" RENAME TO  "banner_type_enum"');
  }
}
