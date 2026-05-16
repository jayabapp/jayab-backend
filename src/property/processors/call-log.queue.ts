import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { PropertyUserService } from '../roles/user/user.service';
import { CALL_LOG_JOB, CALL_LOG_QUEUE } from './queue-name.constants';

@Processor(CALL_LOG_QUEUE)
export class CallLogQueueProcessor {
  constructor(private readonly propertyUserService: PropertyUserService) {}

  /* -------------------------------------------------------------------------- */
  /*                                     SMS                                    */
  /* -------------------------------------------------------------------------- */
  @OnQueueCompleted({ name: CALL_LOG_JOB })
  async onCompleted(): Promise<void> {
    console.log('On Completed: ', CALL_LOG_JOB);
    return;
  }

  @OnQueueFailed({ name: CALL_LOG_JOB })
  async onFailed(): Promise<void> {
    console.log('On Failed: ', CALL_LOG_JOB);
    return;
  }

  /**
   * save call log
   * @returns
   */
  @Process(CALL_LOG_JOB)
  async sendReserveSms(
    job: Job<{ propertyId: number; user: PartialUser; ownerMobile: string }>,
  ): Promise<void> {
    console.log(`Job Start: ${CALL_LOG_JOB}`);
    const { propertyId, user, ownerMobile } = job.data;
    await this.propertyUserService.storeCallLog(propertyId, user, ownerMobile);
  }
}
