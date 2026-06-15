import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { loginWithPassword, register, loading, error, setError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (!email || !password || !confirmPassword) {
        setError("All fields are required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      await register({ email, password, passwordConfirm: confirmPassword }, { onSuccess });
      return;
    }

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    await loginWithPassword(email, password, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700  text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700  text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700  text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium  transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : isRegister ? "Register" : "Sign In"}
      </button>
    </form>
  );
}
