import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
  loadingLabel?: string;
}

/**
 * Shared Cancel / Submit button pair used in creation modals.
 */
export function FormActions({ onCancel, isLoading, submitLabel, loadingLabel = "Creating..." }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-violet-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
