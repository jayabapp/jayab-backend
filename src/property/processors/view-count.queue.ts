import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { PropertyUserService } from '../roles/user/user.service';
import { VIEW_COUNT_JOB, VIEW_COUNT_QUEUE } from './queue-name.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { random } from 'lodash';

@Processor(VIEW_COUNT_QUEUE)
export class ViewCountQueueProcessor {
  constructor(
    private readonly db: PrismaService,
    private readonly propertyUserService: PropertyUserService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                     SMS                                    */
  /* -------------------------------------------------------------------------- */
  @OnQueueCompleted({ name: VIEW_COUNT_JOB })
  async onCompleted(): Promise<void> {
    console.log('Completed: ', VIEW_COUNT_JOB);
    return;
  }

  @OnQueueFailed({ name: VIEW_COUNT_JOB })
  async onFailed(): Promise<void> {
    console.log('Failed: ', VIEW_COUNT_JOB);
    return;
  }

  /**
   * update properties view count
   * @returns
   */
  @Process(VIEW_COUNT_JOB)
  async updatePropertiesViewCount(job: Job<{ propertyIds: number[] }>): Promise<void> {
    console.log(`Job Start: ${VIEW_COUNT_JOB}`);
    const { propertyIds } = job.data;
    for (const id of propertyIds) {
      await this.propertyUserService.updateViewStatistics(id, null, random(1, 5));
    }
  }
}
