
import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "../features/auth/pages/Login.jsx";
import { Dashboard } from "../features/dashboard/pages/Dashboard.jsx";
import { Transfer } from "../features/transfers/pages/Transfer.jsx";
import { Accounts } from "../features/accounts/pages/Accounts.jsx";
import { Account } from "../features/accounts/pages/AccountDetails.jsx";

import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route
            path="/accounts/:accountId"
            element={<Account />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
