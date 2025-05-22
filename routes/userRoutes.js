import express from 'express';
import {
  registerUser,
  loginUser,
  userLogout,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/logout', protect, userLogout);

export default router; 