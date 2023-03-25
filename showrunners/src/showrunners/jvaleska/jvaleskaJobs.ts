// Do Scheduling
// https://github.com/node-schedule/node-schedule
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
// Execute a cron job every 5 Minutes = */5 * * * *
// Starts from seconds = * * * * * *

import config from '../../config';
import logger from '../../loaders/logger';

import { Container } from 'typedi';
import schedule from 'node-schedule';
import JValeskaChannel from './jvaleskaChannel';

export default () => {
/*
  const startTime = new Date(2023, 3, 19, 22, 30, 0);
  const fiveMinuteRule = new schedule.RecurrenceRule();
  fiveMinuteRule.minute = 5;
*/
  const channel = Container.get(JValeskaChannel);
  channel.logInfo(` 🛵 Scheduling Showrunner - ${channel.cSettings.name} Channel`);

  schedule.scheduleJob('*/1 * * * *', async function () {
    const taskName = `${channel.cSettings.name} extend claim date recordatory`;

    try {
      channel.logInfo(`🐣 Cron Task Initializing -- ${taskName}`);
      
      await channel.checkDeadlineExpirationTask(false);

      channel.logInfo(`🐣 Cron Task Completed -- ${taskName}`);
    } catch (err) {
      channel.logInfo(`❌ Cron Task Failed -- ${taskName}`);
      channel.logError(`Error Object: %o`);
      channel.logError(err);
    }
  });
};
