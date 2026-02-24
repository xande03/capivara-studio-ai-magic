import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `capivara-studio-${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button size="icon" variant="outline" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
          <Download className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
