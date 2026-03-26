// import { NextFunction, Request, Response } from "express";
// import jwt, { Secret } from "jsonwebtoken";
// import config from "../config";

// export const auth = () => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const authHeader = req.headers.authorization;

//       // ১. টোকেন আছে কি না চেক করা
//       if (!authHeader) {
//         return res.status(401).json({
//           success: false,
//           message: "You are not authorized! Token missing.",
//         });
//       }

//       // ২. 'Bearer <token>' থেকে শুধু টোকেনটা আলাদা করা
//       const token = authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : authHeader;

//       // ৩. টোকেন ভেরিফাই করা
//       const decoded = jwt.verify(token, config.jwt_secret as Secret) as any;

//       // ৪. req.user এ ডাটা সেট করা (যাতে কন্ট্রোলারে পাওয়া যায়)
//       // req.user = decoded;
//       (req as any).user = decoded;

//       next(); // সব ঠিক থাকলে পরের ধাপে (Controller) পাঠাবে
//     } catch (error) {
//       // 🔍 এরর ডিটেইল দেখার জন্য এটি যোগ করুন
//       res.status(401).json({
//         success: false,
//         message: "Invalid or expired token!",
//       });
//     }
//   };
// };


import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";

// ১. এখানে '...requiredRoles: string[]' যোগ করা হয়েছে যাতে এটি প্যারামিটার নিতে পারে
export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      // ২. টোকেন আছে কি না চেক করা
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized! Token missing.",
        });
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      // ৩. টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, config.jwt_secret as Secret) as any;

      // ৪. রোল চেক করা (এটিই আপনার লাল দাগ দূর করবে এবং সিকিউরিটি বাড়াবে)
      // যদি রাউটে auth('admin') দেওয়া থাকে, তবে চেক করবে ইউজারের রোল 'admin' কি না
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You do not have the required permissions.",
        });
      }

      // ৫. req.user এ ডাটা সেট করা
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