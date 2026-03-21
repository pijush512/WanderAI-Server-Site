import express from 'express';
import { aiControllers } from '../controller/ai.controller';


const router = express.Router();

router.post('/generate-description', aiControllers.generateDescription);

export const AiRoutes = router;