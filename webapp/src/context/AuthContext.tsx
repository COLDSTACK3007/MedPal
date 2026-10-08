import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserProfile {
  username: string;
  role: 'admin' | 'user';
  hasOnboarded: boolean;
  // Patient details collected during onboarding
  age?: string;
  gender?: string;
  contact?: string;
  height?: string;
  weight?: string;
  email?: string;
  lastVisit?: string;
  village?: string;
  fullName?: string;
  address?: string;
  guardians?: { name: string; phone: string; email: string }[];
}

interface AuthContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[]; // Admin access to all profiles
  login: (u: string, p: string) => boolean;
  signup: (u: string, p: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  changePassword: (oldP: string, newP: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Initialize DB from LocalStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('medpal_db_users');
    const storedAuth = localStorage.getItem('medpal_auth_current');
    
    if (storedUsers) {
      setAllUsers(JSON.parse(storedUsers));
    } else {
      // Seed with Admin
      const seed = [{ username: 'admin', password: 'admin123', role: 'admin' as const, hasOnboarded: true }];
      localStorage.setItem('medpal_db_users', JSON.stringify(seed));
      setAllUsers(seed as any);
    }

    if (storedAuth) {
      setCurrentUser(JSON.parse(storedAuth));
    }
  }, []);

  const login = (u: string, p: string) => {
    const users = JSON.parse(localStorage.getItem('medpal_db_users') || '[]');
    const user = users.find((user: any) => user.username === u && user.password === p);
    
    if (user) {
      const profile = { ...user };
      delete profile.password; // Don't keep pass in state
      setCurrentUser(profile);
      localStorage.setItem('medpal_auth_current', JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const signup = (u: string, p: string) => {
    const users = JSON.parse(localStorage.getItem('medpal_db_users') || '[]');
    if (users.some((user: any) => user.username === u)) {
      return false; // User exists
    }

    const newUser = {
      username: u,
      password: p,
      role: 'user',
      hasOnboarded: false,
      lastVisit: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    localStorage.setItem('medpal_db_users', JSON.stringify(users));
    setAllUsers(users); // Update Admin's view

    // Auto login
    const profile = { ...newUser };
    delete (profile as any).password;
    setCurrentUser(profile as UserProfile);
    localStorage.setItem('medpal_auth_current', JSON.stringify(profile));
    
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('medpal_auth_current');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    const updated = { ...currentUser, ...data, hasOnboarded: true };
    setCurrentUser(updated);
    localStorage.setItem('medpal_auth_current', JSON.stringify(updated));

    // Update the master DB
    const users = JSON.parse(localStorage.getItem('medpal_db_users') || '[]');
    const newUsers = users.map((u: any) => 
      u.username === currentUser.username ? { ...u, ...data, hasOnboarded: true } : u
    );
    localStorage.setItem('medpal_db_users', JSON.stringify(newUsers));
    setAllUsers(newUsers);
  };

  const changePassword = (oldP: string, newP: string) => {
    if (!currentUser) return false;
    const users = JSON.parse(localStorage.getItem('medpal_db_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === currentUser.username && u.password === oldP);
    
    if (userIndex !== -1) {
      users[userIndex].password = newP;
      localStorage.setItem('medpal_db_users', JSON.stringify(users));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, login, signup, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
