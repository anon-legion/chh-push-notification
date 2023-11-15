import { body } from 'express-validator';

const baseStrValidation = (field: string) => body(field).isString().trim().notEmpty();

export default baseStrValidation;
