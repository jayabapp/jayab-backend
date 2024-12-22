import { ValidationPipeOptions } from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  disableErrorMessages: false,
  errorHttpStatusCode: 422,
};

export default validationOptions;
