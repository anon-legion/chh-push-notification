import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import { BadRequestError, UnauthenticatedError } from '../errors';
import User from '../models/User';

async function register(req: Request, res: Response): Promise<void> {
  // destructure payload from req.body
  const { username, email, password } = req.body;

  // save user to database
  const user = await User.create({ username, email, password });
  // create token using schema method
  const token = user.createJwt();
  res.status(StatusCodes.CREATED).json({ username: user.username, token });
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  // email and password guard clause
  if (!email || !password) throw new BadRequestError('Please provide user credentials');

  // find user in database
  const user = await User.findOne({ email });
  // user guard clause
  if (!user) throw new UnauthenticatedError('Invalid user credentials');

  // compare password using schema method
  const isValidPassword = await user.comparePassword(password);
  // password guard clause
  if (!isValidPassword) throw new UnauthenticatedError('Invalid user credentials');

  // create token using schema method
  const token = user.createJwt();
  res.status(StatusCodes.OK).json({ username: user.username, token });
}

export { register, login };
