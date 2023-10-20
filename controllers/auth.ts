import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { BadRequestError, UnauthenticatedError } from "../errors";
import User from '../models/User';

async function register(req: Request, res: Response): Promise<void> {
  // destructure payload from req.body
  const { username, email, password } = req.body;

  const user = await User.create({ username, email, password });
  // update IUser to include createJwt method
  const token = user.createJwt();
  res.status(StatusCodes.CREATED).json({ user, token });
}

export default register;
