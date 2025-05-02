import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../db/repositories/user.repository';
import { UserService } from '../services/user.services';
import { authenticateJWT } from '../middlewares/auth';
import { MailService } from '../services/mail.services';

const router = Router();

const userService = new UserService(new UserRepository(), new MailService());
const userController = new UserController(userService);

// Validation middleware for registration
const validateRegistration = [
  // First name validation
  body('first_name')
    .notEmpty().withMessage('First name is required')
    .isString().withMessage('First name must be a string'),

  // Last name validation
  body('last_name')
    .notEmpty().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string'),

  // Email validation
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number') , // Optional: if you want to enforce numbers

  // Phone validation (optional, but must be a valid phone number if provided)
  body('phone')
    .optional()
    .isMobilePhone('any').withMessage('Invalid phone number'),

  // Date of birth validation (optional, must be a valid date if provided)
  body('dob')
    .isDate().withMessage('Invalid date of birth'),

  // Gender validation (optional, can be 'm', 'f', or '0')
  body('gender')
    .isIn(['m', 'f', '0']).withMessage('Invalid gender'),

  // Address validation (optional, must be a valid string if provided)
  body('address')
    .optional()
    .isString().withMessage('Invalid address'),

  // Role validation (must be one of the defined roles)
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['super_admin', 'artist_manager', 'artist'])
    .withMessage('Invalid role')
];

// Validation middleware for login
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];




// Routes
router.route('/register').post(validateRegistration, userController.register.bind(userController));
router.route('/login').post(validateLogin, userController.login.bind(userController));
router.route('/profile').get(authenticateJWT, userController.getProfile.bind(userController))
router.route("/verify-email").get(userController.verifyEmail.bind(userController))
export default router;
