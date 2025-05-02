import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '../services/user.services';

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        dob,
        gender,
        address,
        role,
      } = req.body;

      const userId = await this.userService.registerUser(
        first_name,
        last_name,
        email,
        password,
        phone,
        dob ? new Date(dob) : null,
        gender,
        address,
        role
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { id: userId },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Registration failed',
      });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;
    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    try {
      await this.userService.verifyEmailToken(token as string);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: { is_verified: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Email verification failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    try {
      const { email, password } = req.body;
      const { token, user } = await this.userService.authenticateUser(
        email,
        password
      );

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: { id: user.id, role: user.role },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error?.message || 'Login failed',
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    // @ts-ignore
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    try {
      const user = await this.userService.getUserProfile(userId);
      res.json({
        success: true,
        message: 'Profile fetched successfully',
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender,
          address: user.address,
          role: user.role,
        },
      });
    } catch {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await this.userService.initiatePasswordReset(email);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to send reset email',
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await this.userService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error?.message || 'Password reset failed',
      });
    }
  }
}
