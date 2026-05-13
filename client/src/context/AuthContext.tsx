import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';


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
  refreshToken: () => Promise<string | null>;
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
  const API_URL = import.meta.env.VITE_API_URL;

  // Failsafe: agar Firebase 4 second mein respond na kare, loading band karo
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timeout);
  }, []);
  const login = (userData: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
  }, []);

  const updateUser = (updatedData: Partial<UserInfo>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updatedData };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  /**
   * Silently refreshes the backend JWT using the current Firebase session.
   * This is called automatically when a token expires (401 error).
   * Returns the new token string on success, or null on failure.
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      // Firebase session bhi nahi hai, user ko logout karna hoga
      return null;
    }

    try {
      // Firebase se fresh ID token lo (Firebase apne aap refresh karta hai)
      const freshFirebaseToken = await firebaseUser.getIdToken(true); // force: true
      
      // Backend se naya JWT lo
      const res = await axios.post(`${API_URL}/api/users/google-login`, {
        token: freshFirebaseToken,
      });

      if (res.data?.token) {
        // Naya token save karo
        const updatedUser = { ...res.data };
        // Phone number preserve karo agar pehle se save tha
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.phone && !updatedUser.phone) {
            updatedUser.phone = parsed.phone;
          }
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser.token;
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }, [API_URL]);

  // Step 1: Pehle localStorage se user load karo (quick load)
  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUser(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      localStorage.removeItem('userInfo');
    }
  }, []);

  // Step 2: Firebase auth state monitor karo
  // Agar Firebase session active hai lekin user ne browser band karke rakh
  // to bhi silently JWT refresh ho jaayega
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase session active hai
        const storedUserInfo = localStorage.getItem('userInfo');
        // Sirf tab refresh karo jab localStorage mein user data ho
        // (new user ya cleared localStorage ke case mein skip karo)
        if (storedUserInfo) {
          try {
            const parsed: UserInfo = JSON.parse(storedUserInfo);
            // Admin ka token Firebase se nahi aata, skip karo
            if (!parsed.isAdmin) {
              const freshFirebaseToken = await firebaseUser.getIdToken();
              const res = await axios.post(`${API_URL}/api/users/google-login`, {
                token: freshFirebaseToken,
              });
              if (res.data?.token) {
                const refreshedUser = {
                  ...res.data,
                  phone: parsed.phone || res.data.phone,
                };
                localStorage.setItem('userInfo', JSON.stringify(refreshedUser));
                setUser(refreshedUser);
              }
            }
            // Admin ke liye: existing data se hi kaam chalao
          } catch {
            // Refresh fail hua — existing token se kaam chalao
            if (storedUserInfo) setUser(JSON.parse(storedUserInfo));
          }
        }
      } else {
        // Firebase session nahi hai
        // Agar localStorage mein data hai to clear karo (Admin users ko mat touch karo)
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsed: UserInfo = JSON.parse(storedUserInfo);
            // Admin ka token JWT se manage hota hai, Firebase se nahi
            if (!parsed.isAdmin) {
              // Normal user ka session nahi hai, logout karo
              localStorage.removeItem('userInfo');
              setUser(null);
            }
          } catch {
            localStorage.removeItem('userInfo');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [API_URL]);

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};