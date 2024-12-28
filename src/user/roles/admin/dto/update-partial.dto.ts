import { _IsBoolean, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePartialUserAdminDto {
  @_IsBoolean()
  @_IsNotEmpty()
  is_banned: boolean;
}
