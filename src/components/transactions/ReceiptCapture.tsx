import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { GlassButton } from '../shared/GlassButton';

interface ReceiptCaptureProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

function resizeImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function ReceiptCapture({ value, onChange }: ReceiptCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await resizeImage(file, 800, 0.6);
    onChange(base64);
    // Clear input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Receipt (optional)
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Receipt"
            className="w-24 h-24 object-cover rounded-xl border border-[var(--glass-border)]"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent-expense)] text-white flex items-center justify-center cursor-pointer shadow-md"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <GlassButton
          type="button"
          variant="secondary"
          size="sm"
          icon={<Camera size={14} />}
          onClick={() => inputRef.current?.click()}
        >
          Attach Receipt
        </GlassButton>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
