import { useAuth } from "../../hooks/useAuth";
import { cn } from "../UI";

export function GoogleSignIn({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { loginWithGoogle, loading, error } = useAuth();

  return (
    <div className="w-full">
      <button
        onClick={() => loginWithGoogle({ onSuccess })}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 px-4 py-2 text-gray-800 bg-white hover:bg-gray-100 border border-gray-300  transition-colors disabled:opacity-50",
          className
        )}
      >
        {loading ? (
          "Connecting..."
        ) : (
          <>
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Sign in with Google
          </>
        )}
      </button>

      {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
}
