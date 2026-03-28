import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized! Token missing.",
        });
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;
// verify token
      const decoded = jwt.verify(token, config.jwt_secret as Secret) as any;

    //  check role
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You do not have the required permissions.",
        });
      }

      (req as any).user = decoded;

      next(); 
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }
  };
};