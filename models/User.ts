import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Schema, model, type Document, type MongooseError } from 'mongoose';
import { ConflictError, InternalServerError } from '../errors';
import type { IUser } from './types';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username must be at most 20 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [25, 'Password must be at most 25 characters long'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

// pre-save mongoose middleware to hash password before saving to database
userSchema.pre<IUser>('save', async function hashPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err: any) {
    throw new InternalServerError(String(err));
  }
});

// post-save mongoose middleware to handle duplicate key error
userSchema.post<IUser>(
  'save',
  (err: MongooseError, _doc: Document, next: (err?: MongooseError) => void) => {
    if (err.name === 'MongoServerError' && err.message.includes('E11000')) {
      next(new ConflictError('Duplicate key error, value already exists', ['email']));
    } else {
      next();
    }
  }
);

// schema method to generate token
userSchema.methods.createJwt = function createJwt() {
  return jwt.sign(
    { userId: this._id, username: this.username },
    Buffer.from(process.env.JWT_PRVT_KEY ?? '', 'base64').toString('ascii'),
    {
      algorithm: 'ES384',
      expiresIn: '30d',
    }
  );
};

// schema method to compare password
userSchema.methods.comparePassword = async function comparePw(password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

const User = model<IUser>('User', userSchema);

export default User;
