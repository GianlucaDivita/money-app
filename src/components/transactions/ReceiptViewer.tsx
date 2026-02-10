import { GlassModal } from '../shared/GlassModal';

interface ReceiptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ReceiptViewer({ isOpen, onClose, imageUrl }: ReceiptViewerProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Receipt" size="lg">
      <div className="flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Receipt"
          className="max-w-full max-h-[70vh] object-contain rounded-xl"
        />
      </div>
    </GlassModal>
  );
}
