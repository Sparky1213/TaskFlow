import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../api";
import type { AuthResponse, User } from "../types";

type AuthContextType = {
  token: string | null;
  user: User | null;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("ttm_token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("ttm_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem("ttm_token", token);
    } else {
      localStorage.removeItem("ttm_token");
      localStorage.removeItem("ttm_user");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ttm_user", JSON.stringify(user));
    }
  }, [user]);

  // Fetch user info on mount if we have a token but no user
  useEffect(() => {
    if (token && !user) {
      api
        .get<User>("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null);
          setUser(null);
        });
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setToken(res.data.token);
      setUser(res.data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const res = await api.post<AuthResponse>("/auth/signup", {
          name,
          email,
          password,
        });
        setToken(res.data.token);
        setUser(res.data.user);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
