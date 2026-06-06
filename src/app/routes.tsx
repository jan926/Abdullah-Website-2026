import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";
import GameDetailPage from "./pages/GameDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProtectedRoute, AdminRoute, PublicRoute } from "@/middleware/ProtectedRoute";

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  {
    path: "/admin/login",
    element: (
      <PublicRoute>
        <AdminLoginPage />
      </PublicRoute>
    ),
  },
  
  // Authorization Error Page
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  // Main App Routes
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "game/:id",
        element: (
          <ProtectedRoute>
            <GameDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "categories",
        element: (
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "category/:category",
        element: (
          <ProtectedRoute>
            <CategoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
  },

  // 404 Fallback
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
