import React, { useEffect, useId, useState } from 'react';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { uploadProductImage } from '../utils/imageUpload';

interface ImageFieldProps {
  label: string;
  imageUrl: string;
  onChange: (newUrl: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  previewAlt?: string;
}

/**
 * Reusable staff form field for uploading a compressed product photo to Supabase Storage
 * with live thumbnail preview and optional manual HTTPS URL fallback.
 */
export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  imageUrl,
  onChange,
  onUploadingChange,
  previewAlt = 'Vista previa del plato',
}) => {
  const inputId = useId();
  const fileInputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
  }, [imageUrl]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const publicUrl = await uploadProductImage(file);
      onChange(publicUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error al subir la foto.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  const trimmedUrl = imageUrl.trim();
  const showPreview = Boolean(trimmedUrl) && !previewFailed;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-muted font-medium">
        {label}
      </label>

      <div className="flex items-center gap-3 p-2.5 bg-cream/70 border border-line rounded-xl">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-paper border border-line shrink-0 flex items-center justify-center text-muted">
          {showPreview ? (
            <img
              src={getOptimizedImageUrl(trimmedUrl, 200, 80)}
              alt={previewAlt}
              onError={() => setPreviewFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={20} className="opacity-50" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileSelected}
            className="sr-only"
          />
          <label
            htmlFor={fileInputId}
            aria-disabled={isUploading}
            className={`w-full min-h-[38px] px-3 py-2 rounded-lg bg-wine/10 hover:bg-wine/15 border border-wine/30 text-wine font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isUploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Optimizando y subiendo...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Subir foto del celular o PC</span>
              </>
            )}
          </label>
          <p className="text-[10px] text-muted leading-tight">
            JPG, PNG o WebP · Se comprime sola antes de guardarse.
          </p>
        </div>
      </div>

      {uploadError && (
        <div role="alert" className="p-2 rounded-lg bg-wine/10 text-wine text-[11px] font-medium">
          {uploadError}
        </div>
      )}

      <div>
        <input
          id={inputId}
          type="url"
          value={imageUrl}
          onChange={(e) => {
            setUploadError(null);
            onChange(e.target.value);
          }}
          placeholder="O pegá un enlace manual (https://...)"
          className="w-full min-h-[36px] bg-cream border border-line rounded-xl px-3 py-1.5 text-[11px] text-ink focus:border-wine focus:outline-none"
        />
      </div>
    </div>
  );
};
