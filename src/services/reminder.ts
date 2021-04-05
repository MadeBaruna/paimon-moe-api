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
      .where('type = :type', { type: 'transformer' })
      .andWhere('time >= :start', { start })
      .andWhere('time < :end', { end })
      .getMany();

    const tokens = result.map(e => e.token);
    if (tokens.length > 0) {
      const payload = {
        data: {
          title: 'Parametric Transformer Reminder',
          body: 'Your parametric transformer will be ready soon!',
          url: '/reminder',
        },
      };

      void sendNotification(tokens, payload);
    }
  } catch (err) {
    console.error(err);
  }
}

async function checkHoyolabDailyReminder(): Promise<void> {
  const reminderRepo = getRepository(Reminder);

  const start = dayjs().year(2000).month(0).date(1).utc().second(0).format('YYYY-MM-DD HH:mm:ssZ');
  const end = dayjs().year(2000).month(0).date(1).utc().add(10, 'minute').second(0).format('YYYY-MM-DD HH:mm:ssZ');

  try {
    const result = await reminderRepo
      .createQueryBuilder('reminder')
      .where('type = :type', { type: 'hoyolab' })
      .andWhere('time >= :start', { start })
      .andWhere('time < :end', { end })
      .getMany();

    const tokens = result.map(e => e.token);
    if (tokens.length > 0) {
      const payload = {
        data: {
          title: 'Hoyolab Daily Check-in Reminder',
          body: 'Check-in to Hoyolab now!',
          url: 'https://webstatic-sea.mihoyo.com/ys/event/signin-sea/index.html?act_id=e202102251931481',
        },
      };
      void sendNotification(tokens, payload);
    }
  } catch (err) {
    console.error(err);
  }
}

export function startReminderCron(): void {
  const transformerJob = new CronJob('*/10 * * * *', () => {
    void checkTransformerReminder();
  });

  const hoyolabDailyJob = new CronJob('5-59/10 * * * *', () => {
    void checkHoyolabDailyReminder();
  });

  transformerJob.start();
  hoyolabDailyJob.start();
}
