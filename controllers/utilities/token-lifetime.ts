import type { IAccessToken } from '../../models/types';

function isTokenExpired(token: IAccessToken): boolean {
  const tokenLifeMins = (Number(process.env.TOKEN_LIFE_MINS) ?? 1440) * 60 * 1000;
  const { timeStamp } = token;

  return Date.now() - timeStamp.getTime() >= tokenLifeMins;
}

export default isTokenExpired;
