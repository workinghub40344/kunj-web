import { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface UserInfo {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (userData: UserInfo) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<UserInfo>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUser(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false); // Loading poora hua
    }
  }, []);

  const login = (userData: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<UserInfo>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updatedData };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};