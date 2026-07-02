import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";

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
        lazy: async () => {
          const { default: Component } = await import("./pages/GameDetailPage");
          return { Component };
        },
      },
      {
        path: "categories",
        lazy: async () => {
          const { default: Component } = await import("./pages/CategoriesPage");
          return { Component };
        },
      },
      {
        path: "category/:category",
        lazy: async () => {
          const { default: Component } = await import("./pages/CategoryPage");
          return { Component };
        },
      },
      {
        path: "search",
        lazy: async () => {
          const { default: Component } = await import("./pages/SearchPage");
          return { Component };
        },
      },
      {
        path: "privacy",
        lazy: async () => {
          const { default: Component } = await import("./pages/PrivacyPage");
          return { Component };
        },
      },
      {
        path: "dmca",
        lazy: async () => {
          const { default: Component } = await import("./pages/DMCA");
          return { Component };
        },
      },
      {
        path: "contact",
        lazy: async () => {
          const { default: Component } = await import("./pages/ContactPage");
          return { Component };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { default: Component } = await import("./pages/NotFoundPage");
          return { Component };
        },
      },
    ],
  },
]);
