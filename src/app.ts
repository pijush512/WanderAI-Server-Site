// import cors from "cors";
// import express, { Application, Request, Response } from "express";
// import router from "./routes";
// import path from "path";
// // import router from './routes';

// const app: Application = express();

// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://wander-ai-client-site.vercel.app', 
// ];

// // Parsers
// // app.use(
// //   cors({
// //     origin: true,
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// //     allowedHeaders: ["Content-Type", "Authorization"],
// //   }),
// // );

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('CORS Not Allowed'));
//       }
//     },
//     credentials: true,
//   })
// );


// app.use(express.json());

// // Profile img
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// // Application routes
// app.use("/api/v1", router);

// // Testing route
// app.get("/", (req: Request, res: Response) => {
//   res.send("Event Management Server is running!");
// });

// // Not found route
// app.use((req: Request, res: Response) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// export default app;



import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./routes";
import path from "path";

const app: Application = express();

// অনুমোদিত ডোমেইনগুলোর তালিকা (লোকাল এবং লাইভ ফ্রন্টএন্ড)
const allowedOrigins = [
  "http://localhost:3000",
  "https://wander-ai-client-site.vercel.app", // তোমার লাইভ ফ্রন্টএন্ড ইউআরএল
];

// Parsers
app.use(
  cors({
    origin: (origin, callback) => {
      // Postman বা Server-to-Server রিকোয়েস্টের ক্ষেত্রে origin undefined হতে পারে
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Profile img
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Application routes
app.use("/api/v1", router);

// Testing route
app.get("/", (req: Request, res: Response) => {
  res.send("WanderAI Server is running!");
});

// Not found route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;