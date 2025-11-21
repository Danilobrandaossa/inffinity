import cron, { ScheduledTask } from 'node-cron';
import { config } from '../config';
import { logger } from '../utils/logger';
import { subscriptionService } from '../services/subscription.service';

let scheduledTask: ScheduledTask | null = null;

export function initSubscriptionBillingJob() {
  if (scheduledTask) {
    return;
  }

  if (!config.jobs.subscriptionBilling.enabled) {
    logger.info('Subscription billing job desabilitado via configuração');
    return;
  }

  const expression = config.jobs.subscriptionBilling.cron;

  scheduledTask = cron.schedule(
    expression,
    async () => {
      try {
        const result = await subscriptionService.processDueSubscriptions();

        if (result.processed > 0 || result.errors > 0) {
          logger.info('Subscription billing job executado', result);
        }
      } catch (error) {
        logger.error('Erro ao executar subscription billing job', { error });
      }
    },
    {
      timezone: config.jobs.subscriptionBilling.timezone,
    },
  );

  logger.info('Subscription billing job agendado', {
    expression,
    timezone: config.jobs.subscriptionBilling.timezone,
  });
}

export function stopSubscriptionBillingJob() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info('Subscription billing job parado');
  }
}


