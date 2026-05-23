import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import HomePage from "./pages/HomePage";
import GameDetailPage from "./pages/GameDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "game/:id",
        Component: GameDetailPage,
      },
      {
        path: "categories",
        Component: CategoriesPage,
      },
      {
        path: "category/:category",
        Component: CategoryPage,
      },
      {
        path: "search",
        Component: SearchPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: AdminPage,
      },
      {
        path: "login",
        Component: AdminLoginPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
