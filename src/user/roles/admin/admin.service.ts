import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { allActionsBuilder, createPropsBuilder } from 'src/user/common/helpers/model-props-builder.helper';
import { showPropsBuilder, tablePropsBuilder } from 'src/user/common/helpers/model-props-builder.helper';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { ShowAction, ShowProps, TableProps } from 'src/common/interfaces/model-props.interface';
import { AccessControlList, Prisma, User } from '@prisma/client';
import { CreateProps, OperatorItems } from 'src/common/interfaces/model-props.interface';
import { paginate, PaginatedResult } from 'src/common/helpers/paginator';
import { UpdatePartialUserAdminDto } from './dto/update-partial.dto';
import { SettingAdminService } from 'src/setting/roles/admin/admin.service';
import { SearchUsersAdminDto } from './dto/search.dto';
import { MAX_ACTIVE_DEVICES } from 'src/common/utils/constants/constants';
import { UpdateUserAdminDto } from './dto/update.dto';
import { filterPropsBuilder } from 'src/user/common/helpers/model-props-builder.helper';
import { ConfigService } from '@nestjs/config';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/common/interfaces/role.enum';

import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import moment from 'moment-jalaali';

@Injectable()
export class UserAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly setting: SettingAdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(filters: object, page: number, perPage = 50, skip?: number): Promise<PaginatedResult<User>> {
    const list = await paginate()<User, Prisma.UserFindManyArgs>(
      this.db.user,
      { where: filters },
      { page, perPage, skip },
    );
    return list;
  }

  async findOne(
    id: number,
    rbac: AccessControlList,
  ): Promise<{ showProps: Partial<ShowProps>[]; actions: Array<ShowAction> }> {
    const item = await this.db.user.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    const { showProps, actions } = showPropsBuilder(item, rbac);
    return { showProps, actions };
  }

  async findById(id: number): Promise<User> {
    const item = await this.db.user.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async generateSSOToken(id: number): Promise<string> {
    const user = await this.findById(id);
    const payload: TokenPayload = {
      id: user.id,
      jwtLevel: user.jwt_level || 1,
      role: UserRole.USER,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: '30m',
    });
  }

  async search(dto: SearchUsersAdminDto): Promise<User[]> {
    const result = await this.db.user.findMany({
      where: {
        mobile_number: { contains: dto.q },
      },
    });

    return result;
  }

  async update(user: User, dto: UpdateUserAdminDto): Promise<User> {
    if (dto.mobile_number) {
      const isDuplicated = await this.db.user.findUnique({
        where: { mobile_number: dto.mobile_number },
      });
      if (isDuplicated && isDuplicated.id !== user.id)
        throw new BadRequestException('DUPLICATE_MOBILE_NUMBER');
    }
    const updateData: Prisma.UserUpdateInput = {
      is_banned: dto.is_banned,
      mobile_number: dto.mobile_number,
      full_name: dto.full_name,
      jwt_level: { increment: dto.is_banned ? MAX_ACTIVE_DEVICES : 0 },
    };
    if (!dto.block_click_limit) updateData['contact_click_limit_exceeded_at'] = null;
    else if (!user.contact_click_limit_exceeded_at) {
      const callBlockTtl = await this.setting.get(SettingKey.CALL_CLICK_BAN_TTL);
      updateData['contact_click_limit_exceeded_at'] = moment().add(callBlockTtl, 'day').toDate();
    }
    const item = await this.db.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return item;
  }

  async updatePartial(id: number, dto: UpdatePartialUserAdminDto): Promise<void> {
    console.log('dto', dto);
    const item = await this.db.user.update({ where: { id }, data: dto });
  }

  async createExcel(list: PaginatedResult<User>): Promise<any> {
    const newList = list.data.map((e) => ({
      ...e,
      is_advisor: e.advisor_id ? 'بله' : 'خیر',
      is_owner: e.owner_id ? 'بله' : 'خیر',
      is_banned: e.is_banned ? 'بله' : 'خیر',
      created_at: moment(e.created_at).format('jYYYY/jMM/jDD HH:mm'),
    }));

    const excelCols: ExcelCol[] = [
      { header: 'شماره موبایل', key: 'mobile_number', width: 15 },
      { header: 'مشاور است', key: 'is_advisor', width: 15 },
      { header: 'مالک است', key: 'is_owner', width: 15 },
      { header: 'بلاک شده', key: 'is_banned', width: 15 },
      { header: 'تاریخ ثبت نام', key: 'created_at', width: 15 },
    ];

    const url = await saveToExcel(excelCols, newList, SHEET_NAME.USERS);
    return url;
  }

  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();
    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
