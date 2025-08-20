import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselBasicProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export const CarouselBasic: React.FC<CarouselBasicProps> = ({ 
  images, 
  autoPlay = true, 
  interval = 5000,
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative h-64 rounded-lg overflow-hidden", className)}>
      {/* Main Image */}
      <div className="relative h-full">
        <img 
          src={images[currentIndex]} 
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20"></div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-lg font-semibold">Cazanga</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/50"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};