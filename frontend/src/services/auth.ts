import { User, UserRole } from '@/types/common';
import { apiService } from './api';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  register(arg0: { name: string; email: string; password: string; role: UserRole; }) {
    throw new Error('Method not implemented.');
  }
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Mock authentication - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockUsers: Record<string, User> = {
        'admin@hospital.com': {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'admin@hospital.com',
          role: 'admin',
          avatar: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'doctor@hospital.com': {
          id: '2',
          name: 'Dr. Michael Chen',
          email: 'doctor@hospital.com',
          role: 'doctor',
          avatar: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'nurse@hospital.com': {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'nurse@hospital.com',
          role: 'nurse',
          avatar: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'patient@hospital.com': {
          id: '4',
          name: 'John Smith',
          email: 'patient@hospital.com',
          role: 'patient',
          avatar: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const user = mockUsers[email];
      if (!user || password !== 'password123') {
        throw new Error('Invalid credentials');
      }

      return {
        success: true,
        token: 'mock-jwt-token-' + user.id,
        user,
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async logout(): Promise<void> {
    // Mock logout - replace with actual API call
    return Promise.resolve();
  }

  async validateToken(token: string): Promise<User> {
    try {
      // Mock token validation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!token.startsWith('mock-jwt-token-')) {
        throw new Error('Invalid token');
      }

      const userId = token.replace('mock-jwt-token-', '');
      const mockUser: User = {
        id: userId,
        name: 'Dr. Sarah Johnson',
        email: 'admin@hospital.com',
        role: 'admin',
        avatar: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return mockUser;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mock forgot password - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mock password reset - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Password reset successful'
      };
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }
}

export const authService = new AuthService();