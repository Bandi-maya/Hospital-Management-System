import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/common';
import { authService } from '@/services/auth';
import { PostApi } from '@/ApiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('currentUser');
        const authTimestamp = localStorage.getItem('authTimestamp');

        if (token && storedUser && authTimestamp) {
          // Check if session is still valid (24 hours)
          const timestamp = parseInt(authTimestamp);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (now - timestamp < twentyFourHours) {
            // Validate token with backend
            try {
              const userData = await authService.validateToken(token);
              setUser(userData);
              // Update stored user data
              localStorage.setItem('currentUser', JSON.stringify(userData));
              localStorage.setItem('authTimestamp', Date.now().toString());
            } catch (error) {
              // Token validation failed, use stored user data as fallback
              console.warn('Token validation failed, using stored user data');
              setUser(JSON.parse(storedUser));
            }
          } else {
            // Session expired
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('userRole');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await PostApi("/login", { username: email, password: password });

      if (response.success && response.user) {
        setUser(response.user);

        // Store all authentication data
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user?.role);
        localStorage.setItem('authTimestamp', Date.now().toString());

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
    authService.logout();
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.user_type?.type?.toLowerCase() === role;
  };

  const hasPermission = (permission: string): boolean => {
    console.log(permission)
    if (!user) return false;

    // Define role-based permissions
    const permissions: Record<UserRole, string[]> = {
      admin: ['*'], // Admin has all permissions
      // doctor: ['patients:read', 'patients:write', 'appointments:read', 'appointments:write', 'prescriptions:write', 'tokens:read', 'tokens:write'],
      doctor: ['*'],
      nurse: ['patients:read', 'patients:write', 'vitals:write', 'appointments:read', 'tokens:read', 'tokens:write'],
      // patient: ['appointments:read', 'medical_records:read', 'tokens:read'],
      patient: ['*'],
      receptionist: ['appointments:read', 'appointments:write', 'patients:read', 'patients:write', 'tokens:read', 'tokens:write'],
      pharmacist: ['prescriptions:read', 'medicines:read', 'medicines:write'],
      lab_technician: ['lab_tests:read', 'lab_tests:write', 'lab_reports:write']
    };

    const userPermissions = permissions[user.user_type.type?.toLowerCase()] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  // Helper function to get redirect path based on user role
  const getRedirectPath = (): string => {
    if (!user) return '/dashboard';

    switch (user.user_type.type) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'nurse':
        return '/nurse/dashboard';
      case 'patient':
        return '/patient/dashboard';
      case 'receptionist':
        return '/receptionist/dashboard';
      case 'pharmacist':
        return '/pharmacist/dashboard';
      case 'lab_technician':
        return '/lab/dashboard';
      default:
        return '/dashboard';
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
    getRedirectPath // Export this helper function
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};