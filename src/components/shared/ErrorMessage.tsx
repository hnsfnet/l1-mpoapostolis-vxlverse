interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
      {message}
    </div>
  );
}
