import express from 'express';
import { aiControllers } from '../controller/ai.controller';
import { auth } from '../middlewares/auth';


const router = express.Router();
// --- Admin related Routes 
router.get('/users', auth('admin'), aiControllers.getAllUsers);
router.delete('/users/:id', auth('admin'), aiControllers.deleteUser);
router.get('/system-status', auth('admin'), aiControllers.getSystemStats);
router.get('/admin-stats', auth('admin'), aiControllers.getAdminDashboardStats);
router.patch('/contents/:id/status', auth('admin'), aiControllers.updateContentStatus);
router.patch('/users/:id/role', auth('admin'), aiControllers.updateUserRole);
router.patch('/users/:id/status', auth('admin'), aiControllers.updateUserStatus);
router.get('/contents', auth('admin'), aiControllers.getAllContents); 
router.delete('/contents/:id', auth('admin'), aiControllers.deleteContent);
router.patch('/users/:id/role', auth('admin'), aiControllers.updateUserRole);
router.patch('/users/:id/status', auth('admin'), aiControllers.updateUserStatus);

// Public Route 
router.get('/all-trips', aiControllers.getPublicTrips);
router.get('/trip-details/:id', aiControllers.getSingleTripDetails); // ✅ নতুন
router.get('/all-reviews', aiControllers.getPublicReviews); // ✅ নতুন (হোমপেজ রিভিউ সেকশনের জন্য)

// proctet route
router.post('/generate-trip', auth(), aiControllers.generateTripPlan);
router.get('/my-trips', auth(), aiControllers.getAllTrips);
router.get('/my-reviews', auth(), aiControllers.getAllReviews);
router.post('/create-review', auth(), aiControllers.createReview);
export const AiRoutes = router;