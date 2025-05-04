import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../db/repositories/user.repository';
import { User } from '../repositories/user.repotype';
import { MailService } from './mail.services';
import { config } from 'dotenv';
import { AppError } from '../utils/errorhandler';


config();

const JWT_SECRET = process.env.JWT_SECRET || 'jwt secret key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private mailService: MailService
  ) { }

  // Register a new user
  async registerUser(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
    dob: Date | null,
    gender: 'm' | 'f' | '0',
    address: string,
    role: User['role']
  ): Promise<number> {


    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) throw new AppError('User already exist with this email.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    let hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const userId = await this.userRepository.create(
      first_name,
      last_name,
      email,
      passwordHash,
      phone,
      dob,
      gender,
      address,
      role,
      hashedToken
    );

    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const { success } = await this.mailService.sendVerificationEmail(email, verificationUrl);

    if (!success) {
      await this.userRepository.delete(userId)
      throw new AppError('Server error, Please try again shortly.')
    }

    return userId;

  }

  // Authenticate user and generate JWT
  async authenticateUser(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError('invalid user');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError('invalid credentials');

    if (!user.is_verified) throw new AppError('Please verify your email before logging in');

    const token = this.generateToken(user);
    return { token, user };
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('user not found');
    return user;
  }

  async updateUserProfile(
    userId: number,
    updates: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'address' | 'gender' | 'dob' | 'role'>>
  ): Promise<User> {

    if (updates.email) {
      const existingUser = await this.userRepository.findByEmail(updates.email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email already in use');
      }
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(`User not found with id ${userId}`);
    }

    await this.userRepository.update(userId, updates);

    return { ...user, ...updates };
  }


  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('invalid token');
    }
  }

  async verifyEmailToken(token: string): Promise<void> {
    let hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const user = await this.userRepository.findByVerificationToken(hashedToken);

    if (!user) throw new AppError('Invalid or expired verification token');

    await this.userRepository.updateVerificationStatus(user.id, true, null);

  }

  async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');


    await this.userRepository.update(user.id, { verification_token: hashedToken });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendVerificationEmail(user.email, resetUrl);

  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new AppError('Invalid or expired reset token');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });


    await this.userRepository.update(user.id, { verification_token: null });
  }

  async getAllUsers(limit: number, offset: number, filter?: any) {
    return await this.userRepository.findAll(limit, offset, filter);
  }

  async getTotalUserCount(filter?: any) {
    return await this.userRepository.countTotalUsers(filter);
  }


  async removeUser(id: number, curRole: string) {

    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new AppError("user not ofund", 400)
    }

    if (curRole === 'artist_manager') {
      if (user.role && user.role !== 'artist') {
        throw new AppError('Artist managers can only assign role "artist".', 400)
      }
    }

    return await this.userRepository.delete(id)
  }
}
