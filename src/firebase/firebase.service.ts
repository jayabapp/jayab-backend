import { Inject, Injectable, Logger } from '@nestjs/common';
import firebaseAdmin from 'firebase-admin';
import { MulticastMessage, TopicMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { FCM_OPTIONS } from './constants/firebase.constants';
import { FcmOptions } from './interfaces/fcm-options.interface';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject(FCM_OPTIONS) private readonly fcmOptions: FcmOptions,
    private readonly logger: Logger,
  ) {
    this.__init();
  }

  /**
   * Initialize firebase app
   *
   * *Get Config:*
   * {@link  https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments}
   */
  __init(): void {
    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(this.fcmOptions.configPath),
      });
    }
  }
  async sendNotification(
    deviceIds: Array<string>,
    payload: firebaseAdmin.messaging.MessagingPayload,
    options?: { silent: boolean; imageUrl?: string },
  ): Promise<void> {
    const { silent, imageUrl } = options || {};

    if (deviceIds.length == 0) {
      throw new Error('empty device ids');
    }
    /**
     * check firebase init
     */
    this.__init();

    /**
     * create body
     */
    const body: MulticastMessage = {
      tokens: deviceIds,
      data: payload?.data,
      notification: payload?.notification,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true, // silent ? true : false,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      android: {
        priority: 'high',
        ttl: 60 * 60 * 24,
        notification: {
          sound: payload?.notification?.sound,
        },
      },
      webpush: {
        notification: {
          ...payload.notification,
          badge: './favicon-96x96.png',
          icon: './web-app-manifest-192x192.png',
        },
      },
    };

    try {
      await firebaseAdmin
        .messaging()
        .sendEachForMulticast({ ...body, tokens: deviceIds.splice(0, 500) }, false);
    } catch (error) {
      console.log({ error });

      //   this.logger.error(error.message, error.stackTrace, 'FcmService');
      throw error;
    }

    return;
  }

  /**
   * Subscribe user to specific topic
   * @param token
   * @param topic
   */
  async subscribeToTopic(token: string, topic: string): Promise<void> {
    await firebaseAdmin.messaging().subscribeToTopic(token, topic);
  }

  /**
   * unsubscribe user from specific topic
   * @param token
   * @param topic
   */
  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    await firebaseAdmin.messaging().unsubscribeFromTopic(token, topic);
  }

  /**
   * Send notification to sepecifi topic
   * @param topic
   * @param payload
   * @param options
   * @returns
   */
  async sendNotificationToTopic(
    topic: string,
    payload: firebaseAdmin.messaging.MessagingPayload,
    options?: { silent: boolean; imageUrl?: string },
  ) {
    const { silent, imageUrl } = options || {};

    if (!topic) {
      throw new Error('empty topic');
    }

    /**
     * check firebase init
     */
    this.__init();

    /**
     * create message
     */
    const body: TopicMessage = {
      data: payload?.data || {},
      notification: payload?.notification,
      apns: {
        payload: {
          aps: {
            sound: 'default', //payload?.notification?.sound,
            contentAvailable: true, //silent ? true : false,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      android: {
        priority: 'high',
        ttl: 60 * 60 * 24,
        notification: {
          sound: payload?.notification?.sound,
        },
      },
      webpush: {
        notification: {
          ...payload.notification,
          badge: './favicon-96x96.png',
          icon: './web-app-manifest-192x192.png',
        },
        fcmOptions: payload?.data?.chatroomId
          ? { link: `${process.env.WEBSITE_URL}/chat/${payload?.data?.chatroomId}` }
          : {},
      },
      topic: topic,
    };

    /**
     * Send to topic
     */
    try {
      await firebaseAdmin.messaging().send(body);
    } catch (error: any) {
      console.log(error.message, error.stackTrace, 'FcmService');
      throw error;
    }

    return;
  }
}
