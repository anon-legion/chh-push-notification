import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import { BadRequestError, InternalServerError, UnauthenticatedError } from '../errors';
import resObj from './utilities/success-response';
import User from '../models/User';

async function register(req: Request, res: Response): Promise<void> {
  // destructure payload from req.body
  const { username, email, password } = req.body;

  try {
    // save user to database
    const user = await User.create({ username, email, password });

    res.status(StatusCodes.CREATED).send(resObj('User created pending activation', { username: user.username }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  // email and password guard clause
  if (!email || !password) throw new BadRequestError('Please provide user credentials');

  try {
    // find user in database
    const user = await User.findOne({ email, isActive: true });
    // user guard clause
    if (!user) throw new UnauthenticatedError('Invalid user credentials');

    // compare password using schema method
    const isValidPassword = await user.comparePassword(password);
    // password guard clause
    if (!isValidPassword) throw new UnauthenticatedError('Invalid user credentials');

    // create token using schema method
    const token = user.createJwt();

    res.status(StatusCodes.OK).send(resObj('User login succesfful', { username: user.baseModelName, token }));
  } catch (err: any) {
    console.error(err);
    throw new InternalServerError(err.message ?? 'Something went wrong, try again later');
  }
}

export { register, login };
