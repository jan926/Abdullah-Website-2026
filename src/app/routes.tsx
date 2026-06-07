import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { RouteErrorView } from "./layouts/RouteErrorView";
import StorePage from "./pages/StorePage";
import LibraryPage from "./pages/LibraryPage";
import DownloadsPage from "./pages/DownloadsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteErrorView />,
    children: [
      {
        index: true,
        Component: StorePage,
      },
      {
        path: "library",
        Component: LibraryPage,
      },
      {
        path: "downloads",
        Component: DownloadsPage,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
