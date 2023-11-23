import { body, oneOf } from 'express-validator';

const enumsValidation = (field: string, enums: string[]) =>
  oneOf(
    enums.map((e) => body(field).equals(e)),
    { errorType: 'flat' }
  );

export default enumsValidation;
