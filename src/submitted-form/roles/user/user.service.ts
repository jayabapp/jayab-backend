import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SubmittedForm, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmittedFormUserDto, FormItemDto } from './dto/create.dto';
import { UpdateSubmittedFormUserDto } from './dto/update.dto';
import { FindAllSubmittedFormUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import moment from 'moment-jalaali';
import { isEmpty, omit } from 'lodash';
import { CommonStatuses } from 'src/common/interfaces/common-status.interface';
import { AttachmentService } from 'src/attachment/attachment.service';
import { FormStatuses } from 'src/submitted-form/common/form-status.interface';
import { FormBuilderInputType } from 'src/form-builder/common/form-builder-input-type.enum';

@Injectable()
export class SubmittedFormUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly attachmentService: AttachmentService,
  ) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateSubmittedFormUserDto, ipv4: string): Promise<void> {
    /* ------------------------------- CHECK ITEMS ------------------------------ */
    await this.checkFormValues(dto.content_id, dto.items);

    /* -------------------------------- CHECK IP -------------------------------- */
    const lastFormSubmitted = await this.db.submittedForm.findFirst({
      where: { ip: ipv4, content_id: dto.content_id },
      orderBy: { created_at: 'desc' },
    });

    if (lastFormSubmitted) {
      const timeDiffInMinutes = moment().diff(lastFormSubmitted.created_at, 'minute');

      if (timeDiffInMinutes < 3) throw new BadRequestException('FORM1');
    }

    /* ------------------------------ CHECK IMAGES ------------------------------ */

    let images = [];
    for (const item of dto.items) {
      if (!Array.isArray(item.images) || item.images?.length < 1) continue;
      item.images?.map((img) => {
        if (isNaN(+img)) throw new BadRequestException('FORM5');
        if (!images?.includes(+img)) images.push(+img);
      });
    }

    if (!isEmpty(images)) await this.attachmentService.validateFileOwner(images);

    /* --------------------------------- CREATE --------------------------------- */
    const createData: Prisma.SubmittedFormCreateInput = {
      ...omit(dto, ['items']),
      ip: ipv4,
      status: FormStatuses.WAITING_TO_REVIEW,
    };

    await this.db.$transaction(async (tx) => {
      const submittedForm = await tx.submittedForm.create({
        data: createData,
      });

      for (const item of dto.items) {
        await tx.submittedFormItems.create({
          data: {
            title: item.title,
            value: item.value || '',
            type: item.type,
            submitted_form_id: submittedForm.id,
            images: { connect: item.images?.map((e) => ({ id: +e })) },
          },
        });
      }
    });

    return;
  }

  /**
   * بررسی مقادیر فرم به سفارش بر اساس دسته بندی
   * @param order
   * @param dto
   * @returns
   */
  async checkFormValues(contentId: number, items: FormItemDto[]): Promise<void> {
    //بررسی عنوان ها با دسته بندی
    const forms = await this.db.formBuilder.findMany({ where: { content_id: contentId } });
    if (isEmpty(forms)) throw new BadRequestException('FORM4');

    for (const item of items) {
      // if (item.type !== FormBuilderInputType.IMAGE && !item.value) throw new BadRequestException('FORM6');
      if (item.type === FormBuilderInputType.IMAGE && !Array.isArray(item.images))
        throw new BadRequestException('FORM7');
    }
    const titles = items?.map((e) => e.title);
    for (const t of titles) {
      const i = forms.findIndex((e) => e.title == t);
      if (i < 0) throw new UnprocessableEntityException('FORM2');
    }

    /**
     * بررسی فیلدهای ضروری
     * حذف تایتل و برک
     */
    const mandatoryFields = forms.filter(
      (e) =>
        e.is_mandatory &&
        !([FormBuilderInputType.TITLE, FormBuilderInputType.BREAK] as string[]).includes(e.type),
    );
    for (const f of mandatoryFields) {
      if (!titles.includes(f.title)) throw new UnprocessableEntityException('FORM3');
    }
  }
}
