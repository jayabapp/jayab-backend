import { _IsNotEmpty, _IsString, _Length } from 'src/common/pipes/validator-translate.pipe';

export class SearchUsersAdminDto {
  @_Length(0, 100)
  @_IsString()
  @_IsNotEmpty()
  q: string;
}
