import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import CreateIdeaPage from "../pages/CreateIdeaPage";
import IdeaDetailsPage from "../pages/IdeaDetailsPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-content-primary">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/ideas" : "/login"} replace />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/ideas" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
            isAuthenticated ? (
              <Navigate to="/ideas" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
      <Route
        path="/dashboard"
        element={<Navigate to="/ideas" replace />}
      />
      <Route
        path="/ideas"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas/:idea_id"
        element={
          <ProtectedRoute>
            <IdeaDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ideas/create"
        element={
          <ProtectedRoute>
            <CreateIdeaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-ideas"
        element={
          <ProtectedRoute>
            <Navigate to="/profile" replace />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
