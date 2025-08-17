import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Attachment, Content, ContentQuestion, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentQuestionAdminDto } from './dto/create.dto';
import { UpdateContentQuestionAdminDto } from './dto/update.dto';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/content-question/common/helpers/model-props-builder.helper';
import { FindAllContentQuestionAdminDto } from './dto/find-all.dto';

enum RefEnum {
  image = 'image',
  content = 'content',
}

type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.ContentQuestionScalarFieldEnum;

type ModifiedFilterProps = FilterProps & { key: ModelFields };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

@Injectable()
export class ContentQuestionAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateContentQuestionAdminDto, adminId: number): Promise<ContentQuestion> {
    const newContentQuestion = await this.db.contentQuestion.create({ data: { ...dto, admin_id: adminId } });
    return newContentQuestion;
  }

  /**
   * find all ContentQuestion
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(filters: object, page: number, perPage = 50): Promise<PaginatedResult<ContentQuestion>> {
    const list = await paginate()<ContentQuestion, Prisma.ContentQuestionFindManyArgs>(
      this.db.contentQuestion,
      {
        where: filters,
        include: {
          image: true,
          content: true,
          content_category: true,
        },
      },
      { page, perPage },
    );

    return list;
  }

  /**
   * find many
   * this method used for selectable lists with less than 50 items
   * @returns
   */
  async findMany(): Promise<ContentQuestion[]> {
    const list = await this.db.contentQuestion.findMany();
    return list;
  }

  /**
   * find one contentQuestion
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.contentQuestion.findUnique({
      where: { id },
      include: { content: true, image: true, content_category: true },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<ContentQuestion> {
    const item = await this.db.contentQuestion.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateContentQuestionAdminDto): Promise<ContentQuestion> {
    const item = await this.db.contentQuestion.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.contentQuestion.delete({ where: { id } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const contents = (await this.db.content.findMany({ where: { is_active: true } })).map((e) => ({
      id: e.id,
      title: e.title,
    }));
    const categories = await this.db.contentCategory.findMany({ include: { parent: true } });
    const formattedCategories = categories.map((e) => {
      if (e.parent) return { ...e, title: `${e.title} ⬅ ${e.parent.title}` };
      else return e;
    });

    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(contents, formattedCategories);

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
