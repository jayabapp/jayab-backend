import { Attachment, User } from '@prisma/client';

export type UserJsonType = User & { profile?: Attachment };
export type UserResType = {
  id: number;
  full_name: string;
  mobile_number: string;
  // sheba: string;
  profile: Attachment;
  created_at: Date;
  updated_at: Date;
};

export class UserSerializer {
  static toArray(data: UserJsonType[]): Array<UserResType> {
    const res: UserResType[] = [];
    for (const e of data) {
      res.push({
        ...this.summarize(e),
      });
    }

    return res;
  }

  static toJSON(data: UserJsonType): UserResType {
    const res = { ...this.summarize(data) };
    return res;
  }

  static summarize(data: UserJsonType): UserResType {
    if (!data) return;
    const res = {
      id: data.id,
      full_name: data.full_name,
      profile: data.profile,
      mobile_number: data.mobile_number,
      // sheba: data.sheba,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return res;
  }
}
