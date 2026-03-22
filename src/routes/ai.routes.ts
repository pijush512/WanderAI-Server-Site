import express from 'express';
import { aiControllers } from '../controller/ai.controller';
import { auth } from '../middlewares/auth';


const router = express.Router();

// router.post('/generate-description', aiControllers.generateDescription);
router.post('/generate-trip', aiControllers.generateTripPlan);

export const AiRoutes = router;