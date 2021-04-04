import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getRepository } from 'typeorm';
import { CronJob } from 'cron';

import { Reminder } from '../entities/reminder';
import { sendNotification } from './notification';

dayjs.extend(utc);

async function checkTransformerReminder(): Promise<void> {
  const reminderRepo = getRepository(Reminder);

  const start = dayjs.utc().second(0).format('YYYY-MM-DD HH:mm:ssZ');
  const end = dayjs.utc().add(10, 'minute').second(0).format('YYYY-MM-DD HH:mm:ssZ');

  try {
    const result = await reminderRepo
      .createQueryBuilder('reminder')
      .where('time >= :start', { start })
      .andWhere('time < :end', { end })
      .getMany();

    const tokens = result.map(e => e.token);
    if (tokens.length > 0) {
      void sendNotification(tokens);
    }
  } catch (err) {
    console.error(err);
  }
}

export function startReminderCron(): void {
  const transformerJob = new CronJob('*/10 * * * *', () => {
    void checkTransformerReminder();
  });

  transformerJob.start();
}
