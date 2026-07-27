import { Logger } from '@inducore/logger';

export class OutboxRelayConsumer {
  public async pollAndDispatch(): Promise<void> {
    Logger.info('[Outbox Relayer Worker] Polling pending outbox event table...');
  }
}
