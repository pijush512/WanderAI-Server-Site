// import express from 'express';
// import { eventControllers } from '../controller/event.controller';

// const router = express.Router();
// // Get all events
// router.get('/', eventControllers.getEvents);
// // Get single event
// router.get('/:id', eventControllers.getEventById);
// // Create event
// router.post('/', eventControllers.createEvent);
// // Update event
// router.put('/:id', eventControllers.updateEvent);
// // Delete event
// router.delete('/:id', eventControllers.deleteEvent);

// export const EventRoutes = router;


import express from 'express';
import { eventControllers } from '../controller/event.controller';
import { auth } from '../middlewares/auth';


const router = express.Router();

// ১. আপনার নিজের ট্রিপগুলো (এটি সবার উপরে রাখুন)
router.get('/my-events', auth(), eventControllers.getMyEvents);

// ২. সব ট্রিপ (অ্যাডমিনের জন্য)
router.get('/', auth(), eventControllers.getEvents);

// ৩. নতুন ট্রিপ তৈরি
router.post('/', auth(), eventControllers.createEvent);

// ৪. বাকিগুলো
router.get('/:id', auth(), eventControllers.getEventById);
router.put('/:id', auth(), eventControllers.updateEvent);
router.delete('/:id', auth(), eventControllers.deleteEvent);

export const EventRoutes = router;