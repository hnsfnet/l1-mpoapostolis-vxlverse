import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../UI";

export function UsernamePasswordSignIn({
  onSuccess,
  className,
  isRegister = false,
}: {
  onSuccess?: () => void;
  className?: string;
  isRegister?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const { loading, authError, clearError, signInWithPassword, register } =
    useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";
  const displayError = localError || authError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    const result = await signInWithPassword(email, password);
    if (result) {
      navigate(from, { replace: true });
      onSuccess?.();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email || !password || !confirmPassword) {
      setLocalError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    const result = await register(email, password, confirmPassword);
    if (result) {
      navigate(from, { replace: true });
      onSuccess?.();
    }
  };

  return (
    <form
      onSubmit={isRegister ? handleRegister : handleLogin}
      className={cn("space-y-4", className)}
    >
      {displayError && (
        <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
          {displayError}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      {isRegister && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : isRegister ? "Register" : "Sign In"}
      </button>
    </form>
  );
}
