import express from 'express';
import { userControllers } from '../controller/user.controller';
import multer from 'multer';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Upload Image
const upload = multer({ dest: 'uploads/' });
// Register user
router.post('/register', upload.single('image'), userControllers.register);

// Login user
router.post('/login', userControllers.login);
// Update Profile
router.patch('/update-profile', auth(), upload.single('image'), userControllers.updateProfile);

// Get all users
router.get('/', userControllers.getUsers);

export const UserRoutes = router;