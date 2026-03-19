import { Job } from 'bull';
import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { CHAT_MESSAGE_SMS_JOB, CHAT_MESSAGE_SMS_QUEUE } from './queue-name.constants';
import { SharedChatService } from '../shared-chat.service';

@Processor(CHAT_MESSAGE_SMS_QUEUE)
export class ChatMessageSmsQueueProcessor {
  constructor(private readonly sharedChatService: SharedChatService) {}

  /* -------------------------------------------------------------------------- */
  /*                                     SMS                                    */
  /* -------------------------------------------------------------------------- */
  @OnQueueCompleted({ name: CHAT_MESSAGE_SMS_JOB })
  async onCompleted(): Promise<void> {
    console.log('On Completed: ', CHAT_MESSAGE_SMS_JOB);
    return;
  }

  @OnQueueFailed({ name: CHAT_MESSAGE_SMS_JOB })
  async onFailed(): Promise<void> {
    console.log('On Failed: ', CHAT_MESSAGE_SMS_JOB);
    return;
  }

  /**
   * save call log
   * @returns
   */
  @Process(CHAT_MESSAGE_SMS_JOB)
  async sendSms(
    job: Job<{
      room: {
        uuid: string;
        property_id: number;
        last_message: {
          created_at: Date;
          participant: {
            user_id: number;
          };
        };
      };
      senderParticipantId: number;
    }>,
  ): Promise<void> {
    console.log(`Job Start: ${CHAT_MESSAGE_SMS_JOB}`);

    await this.sharedChatService.sendChatHintToOwner(job.data?.room, job.data?.senderParticipantId);
    return;
  }
}
