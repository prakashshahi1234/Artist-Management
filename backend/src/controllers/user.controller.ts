import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '../services/user.services';
import { User } from '../repositories/user.repotype';
import { ArtistService } from '../services/artist.services';

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response, next:NextFunction) {

      console.log(req.body)
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

      // @ts-ignore
      const curRole = req.user?.role;

      if(curRole==='artist_manager' &&( role==='super_admin' || role==='artist_manager')){
        res.status(500).json({
          success: false,
          message:  'Invalid data.',
        });
        return;
      }

      

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
      const { token, user , artist} = await this.userService.authenticateUser(
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
        data: { id: user.id, role: user.role , artistId:artist?.id},
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
      const {user , artist} = await this.userService.getUserProfile(userId);
      console.log('artist is', artist)
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
          artistId:artist?.id
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


  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
  
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Logout failed',
      });
    }
  }
  


  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;
  
      // @ts-ignore
      const currentUserRole = req.user?.role;
      
      // Determine filter
      let filter: any = {};
      if (currentUserRole === 'artist_manager') {
        filter.role = 'artist';
      }
      // if super_admin: no filter applied
  
      const users = await this.userService.getAllUsers(limit, offset, filter);
      const totalUsers = await this.userService.getTotalUserCount(filter);
  
      const totalPages = Math.ceil(totalUsers / limit);
  
      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to fetch users',
      });
    }
  }
  
  

  async updateProfile(req: Request, res: Response) {
    try {
      const data: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'address' | 'gender' | 'dob' | 'role'>> = req.body;
      const { id } = req.params;
  
      // @ts-ignore
      const curRole = req.user?.role;
  
      if (!data || !id) {
         res.status(400).json({
          success: false,
          message: !id ? 'User ID is required' : 'Invalid details.',
        });
        return;
      }
  
      if (curRole === 'artist_manager') {
        if (data.role && data.role !== 'artist') {
           res.status(403).json({
            success: false,
            message: 'Artist managers can only assign role "artist".',
          });
          return;
        }
      }
  
      const updatedUser = await this.userService.updateUserProfile(parseInt(id), data);
  
       res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedUser,
      });

    } catch (error: any) {
       res.status(500).json({
        success: false,
        message: error?.message || 'An error occurred while updating the profile',
      });
    }
  }
  


  async removeUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // @ts-ignore
      const {user} =req;

      if(user?.id == parseInt(id)){
        res.status(400).json({
          success: false,
          message: 'You cannot remove self identity.',
        });
        return;
      }
  
      if (!id) {
         res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

           // @ts-ignore
      const curRole = req.user?.role;


  
      await this.userService.removeUser(parseInt(id), curRole!);
   
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });


    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to delete user',
      });
    }
  }
  
  
  

}
