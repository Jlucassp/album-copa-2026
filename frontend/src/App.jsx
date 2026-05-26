import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Auth from "./pages/Auth";
import Album from "./pages/Album";
import PublicRepetidas from "./pages/PublicRepetidas";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Album />
          </PrivateRoute>
        }
      />
      <Route path="/repetidas/:userId" element={<PublicRepetidas />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
