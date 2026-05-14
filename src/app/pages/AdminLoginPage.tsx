import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ADMIN_USERNAME = "Malik0cr7";
const ADMIN_PASSWORD = "hycr7070";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem("adminAuthenticated", "true");
        localStorage.setItem("adminUsername", username);
        toast.success("Login successful! Welcome to the admin dashboard.");
        navigate("/admin");
      } else {
        setError("Invalid username or password");
        toast.error("Login failed. Please check your credentials.");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Admin Login
          </h1>
          <p className="text-slate-500">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <Card className="border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-sky-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-sky-500"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
               <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login to Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Protected area - authorized access only</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
