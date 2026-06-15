import { useAuthStore } from "../../stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../UI";

export function GoogleSignIn({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { loading, signInWithOAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
    const result = await signInWithOAuth("google");
    if (result) {
      navigate(from, { replace: true });
      onSuccess?.();
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className={cn(
        "flex w-full items-center justify-center gap-2 px-4 py-2 text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50",
        className
      )}
    >
      {loading ? (
        "Connecting..."
      ) : (
        <>
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          Sign in with Google
        </>
      )}
    </button>
  );
}
