import { User, AccessControlRole, Admin } from '@prisma/client';
import { Request } from 'express';
import { OwnerStatus } from 'src/owner/common/owner-status.type';

export type PartialUser = { id: number; mobile_number: string; owner_id: number; advisor_id: number };
export type UserType = PartialUser & { accessToken: string };
export type RequestType = Request & { user: UserType; interceptor_data?: any };

export type AdminType = Admin & { role: AccessControlRole };
export type AdminRequestType = Request & { user: AdminType; interceptor_data?: any };

/** User dashboard type */
export type UDType = { level: number; count: number; gain: number; total_gain: number };
