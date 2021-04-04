import { FastifyInstance } from 'fastify';
import { getRepository } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { Reminder } from '../entities/reminder';

import ReminderRequestSchema from '../schemas/reminderRequest.json';
import ReminderListRequestSchema from '../schemas/reminderListRequest.json';
import { ReminderRequest } from '../types/reminderRequest';
import { ReminderListRequest } from '../types/reminderListRequest';

dayjs.extend(utc);

export default async function (server: FastifyInstance): Promise<void> {
  server.get<{Querystring: ReminderListRequest}>('/reminder', {
    schema: {
      querystring: ReminderListRequestSchema,
    },
  }, async (req, reply) => {
    const reminderRepo = getRepository(Reminder);

    try {
      const result = await reminderRepo.findOne({
        where: {
          token: req.query.token,
          type: req.query.type,
        },
      });

      return result ?? {};
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  server.post<{ Body: ReminderRequest }>('/reminder', {
    schema: {
      body: ReminderRequestSchema,
    },
  }, async (req, reply) => {
    const reminderRepo = getRepository(Reminder);

    let reminder: Reminder;

    try {
      const result = await reminderRepo.findOne({
        where: {
          token: req.body.token,
          type: req.body.type,
        },
      });

      if (result !== undefined) {
        reminder = result;
        reminder.time = req.body.time;
      } else {
        reminder = reminderRepo.create({
          time: req.body.time,
          token: req.body.token,
          type: req.body.type,
        });
      }
    } catch (err) {
      server.log.error(err);
      void reply.status(500);
      throw new Error('error when querying for saved reminder');
    }

    try {
      await reminderRepo.save(reminder);
    } catch (err) {
      server.log.error(err);
      void reply.status(500);
      throw new Error('error saving reminder');
    }

    return { reminder };
  });
}
