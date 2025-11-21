
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ImageModal = ({ isOpen, onClose, imageUrl, altText }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-contain"
          onClick={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
