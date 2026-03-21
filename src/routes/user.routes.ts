import express from 'express';
import { userControllers } from '../controller/user.controller';
import multer from 'multer';

const router = express.Router();

// Upload Image
const upload = multer({ dest: 'uploads/' });
// Register user
router.post('/register', upload.single('image'), userControllers.register);

// Login user
router.post('/login', userControllers.login);
// Get all users
router.get('/', userControllers.getUsers);

export const UserRoutes = router;