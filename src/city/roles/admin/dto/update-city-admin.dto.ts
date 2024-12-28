import { PartialType } from '@nestjs/swagger';
import { CreateCityAdminDto } from './create-city-admin.dto';

export class UpdateCityAdminDto extends PartialType(CreateCityAdminDto) {}
