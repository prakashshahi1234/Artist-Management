import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../db/repositories/user.repository';
import { UserService } from '../services/user.services';
import { authenticateJWT, checkRoles } from '../middlewares/auth';
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
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  
  body('phone')
    .optional()
    .isMobilePhone('any').withMessage('Invalid phone number'),


  body('dob')
    .isDate().withMessage('Invalid date of birth'),

  // 
  body('gender')
    .isIn(['m', 'f', 'o']).withMessage('Invalid gender'),

  // A
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
router.route('/register-admin').post(validateRegistration, userController.register.bind(userController));
router.route('/register').post(authenticateJWT,checkRoles('super_admin' , 'artist_manager' , 'artist') ,validateRegistration, userController.register.bind(userController));
router.route('/login').post(validateLogin, userController.login.bind(userController));
router.route('/profile').get(authenticateJWT, userController.getProfile.bind(userController))
router.route("/verify-email").get(userController.verifyEmail.bind(userController))
router.route("/forgot-password").post(userController.forgotPassword.bind(userController))
router.route("/reset-password").post(userController.resetPassword.bind(userController))
router.route("/").get(authenticateJWT, checkRoles("super_admin", "artist_manager"), userController.getAllUsers.bind(userController) )
router.route("/update/:id").patch(authenticateJWT, checkRoles("super_admin", "artist_manager"), userController.updateProfile.bind(userController) )
router.route("/remove/:id").delete(authenticateJWT, checkRoles("super_admin"), userController.removeUser.bind(userController) )

export default router;
