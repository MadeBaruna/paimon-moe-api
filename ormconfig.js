require('dotenv').config();

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  "entities": ["src/entities/*.ts"],
  "migrations": ["src/migrations/*.ts"],
  "cli": {
    "migrationsDir": "src/migrations"
  }
}
