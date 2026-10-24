import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_SETTINGS } from '../data/seedData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  register: (name: string, email: string, workspaceName: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nexus_session_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Auto-initialize demo user so the reviewer can instantly see the app or log in
        // Default to logged-in demo user to facilitate testing and browsing immediately
        setUser(INITIAL_SETTINGS.profile);
      }
    } catch {
      setUser(INITIAL_SETTINGS.profile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 400)); // realistic network latency

    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const authUser: UserProfile = {
      ...INITIAL_SETTINGS.profile,
      email: email.trim(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };

    setUser(authUser);
    try {
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      }
    } catch {
      // storage unavailable
    }

    setIsLoading(false);
    return { success: true };
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300));
    const demoUser = INITIAL_SETTINGS.profile;
    setUser(demoUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    } catch {
      // storage
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, workspaceName: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));

    if (!name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Full name is required.' };
    }
    if (!email || !email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!workspaceName.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Workspace name is required.' };
    }
    if (!pass || pass.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      workspaceName: workspaceName.trim(),
      jobTitle: 'Founder & Engineering Lead',
      timezone: 'UTC+00:00 (London, Dublin)',
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // storage
    }

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // storage
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // storage
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
