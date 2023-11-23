import { body } from 'express-validator';

const paginationValidation = (field: string) => body(field).isString().trim().notEmpty();

export default paginationValidation;
