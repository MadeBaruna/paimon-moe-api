import fs from 'fs';
import readline from 'readline';
import { redis } from '../redis';

const proxies: string[] = [];
let max = 0;

export const errors: {[key: string]: number} = {};
export const proxyresets: {[key: string]: number} = {};

async function loadProxy(): Promise<void> {
  const fileStream = fs.createReadStream(process.env.PROXY_LOCATION ?? 'proxies.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const p = line.trim();
    if (p === '') continue;
    proxies.push(`http://${p}`);
  }

  max = proxies.length;
}

void loadProxy();

export async function getProxy(ip: string): Promise<string> {
  const currentProxy = await redis.get(`proxy:${ip}`);

  if (currentProxy === null) {
    const random = Math.floor(Math.random() * max);
    const newProxy = proxies[random];

    await redis.set(`proxy:${ip}`, newProxy, 'EX', 3600);
    return newProxy;
  }

  return currentProxy;
}

export async function unassignProxy(ip: string): Promise<void> {
  await redis.del(`proxy:${ip}`);
}
