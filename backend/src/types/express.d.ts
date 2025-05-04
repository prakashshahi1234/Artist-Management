export interface DecodedUser{
  id: number;
  email: string;
  role:  'super_admin' | 'artist_manager' | 'artist'
};

import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?:DecodedUser;
    }
  }
}

export {}
