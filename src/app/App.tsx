import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
