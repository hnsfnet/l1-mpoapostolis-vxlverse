import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, remembering the page they were trying to reach.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
