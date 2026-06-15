import { Image, X } from "lucide-react";
import { Input } from "../UI/input";

interface ThumbnailUploadProps {
  preview: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  error?: string | null;
}

/**
 * Shared thumbnail upload + preview component.
 * Handles file-type and size validation internally.
 */
export function ThumbnailUpload({ preview, onFileSelect, onClear, error }: ThumbnailUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return; // let parent handle error via onFileSelect validation if needed
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-dashed border-white/10 hover:border-blue-400/50 transition-all duration-300 group">
        {preview ? (
          <div className="relative h-full">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-4 right-4 p-2.5 bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/30 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group-hover:bg-white/5 transition-all duration-300">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-violet-500/10 group-hover:scale-110 transition-all duration-300">
              <Image className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
            </div>
            <span className="text-sm text-gray-500 group-hover:text-blue-400 mt-4 transition-colors duration-300">
              Click to upload thumbnail
            </span>
            <span className="text-xs text-gray-600 mt-1">Recommended: 1920x1080px</span>
            <Input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
