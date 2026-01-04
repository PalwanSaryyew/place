// components/product/FullScreenImageViewer.tsx
import Image from "next/image";
import React from "react";

interface FullScreenImageViewerProps {
   imageUrls: string[];
   currentImageIndex: number;
   onClose: () => void;
   onNavigate: (newIndex: number) => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
   imageUrls,
   currentImageIndex,
   onClose,
   onNavigate,
}) => {
   const handlePrev = () => {
      if (currentImageIndex > 0) {
         onNavigate(currentImageIndex - 1);
      }
   };

   const handleNext = () => {
      if (currentImageIndex < imageUrls.length - 1) {
         onNavigate(currentImageIndex + 1);
      }
   };

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
         onClick={onClose}
      >
         <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
         >
            <Image
               src={imageUrls[currentImageIndex]}
               alt="Full-screen"
               fill
               className="object-contain"
            />
            <button
               onClick={onClose}
               className="absolute top-0 right-0 m-4 text-white text-2xl z-10"
            >
               &times;
            </button>
            {imageUrls.length > 1 && (
               <>
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                     }}
                     disabled={currentImageIndex === 0}
                     className="absolute left-0 top-1/2 -translate-y-1/2 m-4 text-white text-3xl disabled:opacity-50 z-10"
                  >
                     &#10094;
                  </button>
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                     }}
                     disabled={currentImageIndex === imageUrls.length - 1}
                     className="absolute right-0 top-1/2 -translate-y-1/2 m-4 text-white text-3xl disabled:opacity-50 z-10"
                  >
                     &#10095;
                  </button>
               </>
            )}
         </div>
      </div>
   );
};

export default FullScreenImageViewer;
