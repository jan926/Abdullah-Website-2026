import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { AppErrorBoundary } from "./layouts/AppErrorBoundary";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      storageKey="dyg-theme"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AppErrorBoundary>
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </ThemeProvider>
  );
}
