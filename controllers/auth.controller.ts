import { StatusCodes } from 'http-status-codes';
import { InternalServerError, UnauthenticatedError } from '../errors';
import User from '../models/User';
import resObj from './utilities/success-response';
import type { Request, Response, NextFunction } from 'express';

interface UserRequestBody {
  username: string;
  email: string;
  password: string;
}

/**
 * Registers a new user.
 *
 * @param req - request object.
 * @param res - response object.
 * @param next - next function.
 * @returns Promise<void>
 */
async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  // destructure payload from req.body
  const { username = '', email = '', password = '' }: UserRequestBody = req.body;

  try {
    // save user to database
    const user = await User.create({ username, email, password });

    if (user == null || !Object.keys(user).length)
      throw new InternalServerError('Invalid user credentials');

    res
      .status(StatusCodes.CREATED)
      .send(resObj('User created pending activation', { username: user.username }));
  } catch (err: any) {
    next(err);
  }
}

/**
 * Handles the login request.
 *
 * @param req - request object.
 * @param res - response object.
 * @param next - next function.
 * @returns Promise<void>
 */
async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email = '', password = '' }: UserRequestBody = req.body;

  try {
    // find user in database
    const user = await User.findOne({ email, isActive: true }).select('-__v');

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
      .send(resObj('User login successful', { username: user.username, token }));
  } catch (err: any) {
    next(err);
  }
}

export { register, login };
