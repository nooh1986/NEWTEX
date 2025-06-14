import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check localStorage first (remember me), then sessionStorage
      let savedUser = localStorage.getItem('newtex_user');
      let token = localStorage.getItem('newtex_token');
      
      if (!savedUser || !token) {
        savedUser = sessionStorage.getItem('newtex_user');
        token = sessionStorage.getItem('newtex_token');
      }
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('newtex_user');
          localStorage.removeItem('newtex_token');
          sessionStorage.removeItem('newtex_user');
          sessionStorage.removeItem('newtex_token');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);  const login = async (username: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://istanbul.almaestro.org/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Create user object (adjust based on actual API response)
        const userData: User = {
          id: data.user?.id || data.id || data.user_id || username,
          username: data.user?.username || data.username || data.name || username,
          email: data.user?.email || data.email,
          name: data.user?.name || data.name || data.username || username,
        };        // Save user data and token
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('newtex_user', JSON.stringify(userData));
        if (data.token || data.access_token) {
          storage.setItem('newtex_token', data.token || data.access_token);
        }
        
        // Store remember preference
        localStorage.setItem('newtex_remember', rememberMe.toString());

        setUser(userData);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', response.status, response.statusText, errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
        // Call logout API
      await fetch('https://istanbul.almaestro.org/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('newtex_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);    } finally {
      // Clear both localStorage and sessionStorage regardless of API response
      localStorage.removeItem('newtex_user');
      localStorage.removeItem('newtex_token');
      localStorage.removeItem('newtex_remember');
      sessionStorage.removeItem('newtex_user');
      sessionStorage.removeItem('newtex_token');
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
