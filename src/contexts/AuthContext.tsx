import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@lacasademipa.com',
    password: 'admin123',
    name: 'Carlos Administrador',
    roles: ['admin', 'seller', 'baker', 'designer', 'assembler', 'delivery'],
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'vendedor@lacasademipa.com',
    password: 'venta123',
    name: 'María Vendedora',
    roles: ['seller'],
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'panadero@lacasademipa.com',
    password: 'horno123',
    name: 'Juan Panadero',
    roles: ['baker'],
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'decorador@lacasademipa.com',
    password: 'diseño123',
    name: 'Ana Decoradora',
    roles: ['designer'],
    createdAt: new Date(),
  },
  {
    id: '5',
    email: 'armador@lacasademipa.com',
    password: 'armar123',
    name: 'Pedro Armador',
    roles: ['assembler'],
    createdAt: new Date(),
  },
  {
    id: '6',
    email: 'delivery@lacasademipa.com',
    password: 'envio123',
    name: 'Luis Delivery',
    roles: ['delivery'],
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('bakery_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bakery_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bakery_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bakery_user');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) || user?.roles.includes('admin') || false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
