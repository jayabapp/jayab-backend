import { Attachment, MessengerMessages } from '@prisma/client';

export type MessengerMessagesJsonType = MessengerMessages & {
  media?: Attachment;
};

export type MessengerMessagesResType = {
  id: number;
  participant_id: number;
  created_at: Date;
  deleted_at: Date;
  text: string;
  media?: Attachment;
};

export class MessengerMessagesSerializer {
  static toArray(data: MessengerMessagesJsonType[]): Array<MessengerMessagesResType> {
    const res: MessengerMessagesResType[] = [];
    for (const e of data) {
      res.push({
        ...this.summarize(e),
      });
    }

    return res;
  }

  static toJSON(data: MessengerMessagesJsonType): MessengerMessagesResType {
    const res = { ...this.summarize(data) };
    return res;
  }

  static summarize(data: MessengerMessagesJsonType): MessengerMessagesResType {
    const isDeleted = !!data?.deleted_at;
    
    const res: MessengerMessagesResType = {
      id: data.id,
      participant_id: data?.participant_id,
      created_at: data.created_at,
      deleted_at: data?.deleted_at,
      text: !isDeleted ? data.text : null,
      media: !isDeleted ? data?.media : null,
    };

    return res;
  }
}
