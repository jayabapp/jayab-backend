import { AccessControlRole, Admin } from '@prisma/client';
import { Request } from 'express';

export type PartialUser = {
  id: number;
  mobile_number: string;
  advisor_id: number;
  owner_id: number;
  notification_read_at: Date;
  created_at: Date;
  jwt_level: number;
  contact_click_limit_exceeded_at: Date;
};
export type UserType = PartialUser & { accessToken: string };
export type RequestType = Request & { user: UserType; interceptor_data?: any };

export type AdminType = Admin & { role: AccessControlRole };
export type AdminRequestType = Request & { user: AdminType; interceptor_data?: any };

/** User dashboard type */
export type UDType = { level: number; count: number; gain: number; total_gain: number };
