import { StatusCodes } from 'http-status-codes';
import type { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '../errors';
import resObj from './utilities/success-response';
import User from '../models/User';

interface UserRequestBody {
  username: string;
  email: string;
  password: string;
}

async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  // destructure payload from req.body
  const { username = '', email = '', password = '' }: UserRequestBody = req.body;

  try {
    // save user to database
    const user = await User.create({ username, email, password });

    res
      .status(StatusCodes.CREATED)
      .send(resObj('User created pending activation', { username: user.username }));
  } catch (err: any) {
    next(err);
  }
}

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email = '', password = '' }: UserRequestBody = req.body;

  try {
    // find user in database
    const user = await User.findOne({ email, isActive: true }).select('-_id');

    // user guard clause
    if (!user) throw new UnauthenticatedError('Invalid user credentials');

    // compare password using schema method
    const isValidPassword = await user.comparePassword(password);

    // password guard clause
    if (!isValidPassword) throw new UnauthenticatedError('Invalid user credentials');

    // create token using schema method
    const token = user.createJwt();

    res
      .status(StatusCodes.OK)
      .send(resObj('User login succesfful', { username: user.username, token }));
  } catch (err: any) {
    next(err);
  }
}

export { register, login };
