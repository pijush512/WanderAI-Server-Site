import express from 'express';
import { aiControllers } from '../controller/ai.controller';
import { auth } from '../middlewares/auth';


const router = express.Router();
// --- Admin Management Routes ---
// এগুলোর ফুল ইউআরএল হবে: /api/v1/admin/users
router.get('/users', auth('admin'), aiControllers.getAllUsers);
router.delete('/users/:id', auth('admin'), aiControllers.deleteUser);
router.get('/system-status', auth('admin'), aiControllers.getSystemStats);
// এই এন্ডপয়েন্টটিই ফ্রন্টএন্ড কল করছে


// এই রাউটটি মিসিং ছিল, এখন যোগ করে দিন:
router.get('/admin-stats', auth('admin'), aiControllers.getAdminDashboardStats);
// --- Content Management Routes ---
router.get('/contents', auth('admin'), aiControllers.getAllContents); // এইটিই আপনার ৪0৪ ফিক্স করবে
router.delete('/contents/:id', auth('admin'), aiControllers.deleteContent);
// এই পাথটি ফ্রন্টএন্ডের axios কলের সাথে হুবহু মিলতে হবে
router.patch('/contents/:id/status', auth('admin'), aiControllers.updateContentStatus);

// Admin Management Routes সেকশনে এগুলো যোগ করুন
router.patch('/users/:id/role', auth('admin'), aiControllers.updateUserRole);
router.patch('/users/:id/status', auth('admin'), aiControllers.updateUserStatus);

// Public Route (লগইন লাগবে না)
router.get('/all-trips', aiControllers.getPublicTrips);
router.get('/trip-details/:id', aiControllers.getSingleTripDetails); // ✅ নতুন
router.get('/all-reviews', aiControllers.getPublicReviews); // ✅ নতুন (হোমপেজ রিভিউ সেকশনের জন্য)


// router.post('/generate-description', aiControllers.generateDescription);
router.post('/generate-trip', auth(), aiControllers.generateTripPlan);
// ger routes
router.get('/my-trips', auth(), aiControllers.getAllTrips);
// get reviews
router.get('/my-reviews', auth(), aiControllers.getAllReviews);
// post reviews 
router.post('/create-review', auth(), aiControllers.createReview);
export const AiRoutes = router;