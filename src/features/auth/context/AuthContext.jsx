
import {
  createContext,
  useContext,
  useState,
} from "react";

import { logout as logoutService } from "../services/authServices.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("userData");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      sessionStorage.removeItem("userData");
      return null;
    }
  });

  const loginUser = (result) => {
    sessionStorage.setItem("userData", JSON.stringify(result));
    setUser(result);
  };

  const logoutUser = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}

