import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.services";
import { DecodedUser } from "../types/express";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken; // Access the cookie
     
    if (!token) {
       res.status(403).json({ message: 'Access denied, no token provided' });
       return;
    }
  
    try {
      const decoded = UserService.verifyToken(token);
      // @ts-ignore
      req.user = decoded; 
      next();
    } catch (error) {
       res.status(401).json({ message: 'Invalid or expired token' });
       return;
    }
  };





export const checkRoles =
  (...allowedRoles: DecodedUser['role'][]) =>
  (req: Request, res: Response, next: NextFunction) => {
     // @ts-ignore
    const user = req.user

    if (!user) {
       res.status(401).json({ message: 'Unauthorized' });
       return;
    }

    if (!allowedRoles.includes(user.role)) {
       res.status(403).json({ message: 'Forbidden: Access denied' });
       return;
    }

    next()
  }

  