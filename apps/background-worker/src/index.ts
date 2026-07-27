import { Logger } from '@inducore/logger';
import { OutboxRelayConsumer } from './consumers/OutboxRelayConsumer.js';

const consumer = new OutboxRelayConsumer();
Logger.info('InduCore Background Worker started successfully.');

setInterval(() => {
  consumer.pollAndDispatch().catch(err => Logger.error('Outbox poll error:', err));
}, 15000);
