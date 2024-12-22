import { DynamicModule, Global, Logger, Module, ValueProvider } from '@nestjs/common';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { FcmOptions } from './interfaces/fcm-options.interface';
import { FCM_OPTIONS } from './constants/firebase.constants';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(options:FcmOptions):DynamicModule{
    const optionsProvider: ValueProvider = {
      provide: FCM_OPTIONS,
      useValue: options,
    };
    const logger = 'FcmService'
    return {
      module:FirebaseModule,
      providers:[
        {provide:Logger,useValue:logger},
        FirebaseService,
        optionsProvider
      ],
      exports:[FirebaseService]
    }
  }
}
