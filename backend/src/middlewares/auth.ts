import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.services";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken; // Access the cookie
     
    if (!token) {
       res.status(403).json({ message: 'Access denied, no token provided' });
       return;
    }
  
    try {
      const decoded = UserService.verifyToken(token); // Verify the token using your service
      // @ts-ignore
      req.user = decoded; // Attach user data to the request object
      next();
    } catch (error) {
       res.status(401).json({ message: 'Invalid or expired token' });
       return;
    }
  };
  