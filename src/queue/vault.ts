import Queue from 'bull';

const queue = new Queue('wish-vault', process.env.REDIS_URL ?? 'redis://localhost:6379');

export default queue;
