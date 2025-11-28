import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getMe);

export default router;
