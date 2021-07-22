import Queue, { Job } from 'bull';
import axios from 'axios';

const queue = new Queue('plausible', process.env.REDIS_URL ?? 'redis://localhost:6379');
const url = process.env.PLAUSIBLE_URL ?? '';
const token = process.env.PLAUSIBLE_TOKEN ?? '';
console.log(JSON.stringify({ message: 'plausible queue init' }));

interface TimescaleResult {
  results: {
    visitors: {
      value: number;
    };
  };
}

let visitors = 0;

async function updateVisitorCount(job: Job): Promise<void> {
  const { data } = await axios.get<TimescaleResult>(`${url}/stats/aggregate?site_id=paimon.moe&period=7d&metrics=visitors`, {
    timeout: 10000,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  visitors = data.results.visitors.value;
}

void queue.process(1, updateVisitorCount);

void queue.add(null);
void queue.add(null, { repeat: { cron: '0 * * * *' } });

queue.on('active', (job) => {
  console.log(JSON.stringify({ message: 'updating visitor count', id: job.id }));
});

queue.on('failed', (job, error) => {
  console.log(JSON.stringify({ message: 'failed updating visitor count', id: job.id }));
  console.error(error);
});

export function getVisitorCount(): number {
  return visitors;
}
