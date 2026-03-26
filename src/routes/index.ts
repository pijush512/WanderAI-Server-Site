import express from 'express';
import { EventRoutes } from './event.routes';
import { AiRoutes } from './ai.routes';
import { UserRoutes } from './user.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/events',
    route: EventRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/ai',
    route: AiRoutes,
  },
  {
    path: '/admin',
    route: AiRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;