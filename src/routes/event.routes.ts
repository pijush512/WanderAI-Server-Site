import express from 'express';
import { eventControllers } from '../controller/event.controller';
import { auth } from '../middlewares/auth';


const router = express.Router();
// my event
router.get('/my-events', auth(), eventControllers.getMyEvents);

router.get('/', auth(), eventControllers.getEvents);

router.post('/', auth(), eventControllers.createEvent);

router.get('/:id', auth(), eventControllers.getEventById);
router.put('/:id', auth(), eventControllers.updateEvent);
router.delete('/:id', auth(), eventControllers.deleteEvent);

export const EventRoutes = router;