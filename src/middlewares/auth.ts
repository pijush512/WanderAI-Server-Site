import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';

export const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      // ১. টোকেন আছে কি না চেক করা
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized! Token missing.',
        });
      }

      // ২. 'Bearer <token>' থেকে শুধু টোকেনটা আলাদা করা
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;

      // ৩. টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, config.jwt_secret as Secret) as any;

      // ৪. req.user এ ডাটা সেট করা (যাতে কন্ট্রোলারে পাওয়া যায়)
      req.user = decoded; 

      next(); // সব ঠিক থাকলে পরের ধাপে (Controller) পাঠাবে
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token!',
      });
    }
  };
};