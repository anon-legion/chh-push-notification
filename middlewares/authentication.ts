import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthenticatedError } from '../errors';

async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  // authHeader guard clause
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new UnauthenticatedError('Authentication invalid');

  // extract token from authHeader
  const token = authHeader.split(' ')[1];
  // token guard clause
  if (!token) throw new UnauthenticatedError('Invalid token');

  try {
    // verify token
    const payload = jwt.verify(
      token,
      Buffer.from(process.env.JWT_PBLC_KEY ?? '', 'base64').toString('ascii')
    ) as JwtPayload;
    // token validation and expiry guard claues
    if (payload.exp != null && payload.exp * 1000 < Date.now())
      throw new UnauthenticatedError('Invalid token');

    // find user in database
    const user = await User.findById(payload.userId).select('-password');
    // existing user guard clause
    if (!user) throw new UnauthenticatedError('User not found');

    // attach userId and username to req.user
    req.user = { userId: user?._id, username: user?.username };
    next();
  } catch (err) {
    console.error(err);
    throw new UnauthenticatedError('Authentication invalid');
  }
}

export default authenticate;
