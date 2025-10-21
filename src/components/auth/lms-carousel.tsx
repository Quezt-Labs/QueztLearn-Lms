"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface LMSCarouselProps {
  images: CarouselImage[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

export function LMSCarousel({
  images,
  autoRotate = true,
  rotationInterval = 5000,
}: LMSCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Preload images to reduce flickering
  useEffect(() => {
    images.forEach((image) => {
      const img = new window.Image();
      img.src = image.src;
    });
  }, [images]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [images.length, autoRotate, rotationInterval]);

  return (
    <div className="space-y-8 w-full">
      {/* Carousel Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative w-full"
      >
        <div className="relative overflow-hidden rounded-xl shadow-2xl h-[300px]">
          {/* Fallback background */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/40"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-full"
            >
              <Image
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                width={500}
                height={300}
                className="w-full h-full object-cover"
                priority={currentImageIndex === 0}
              />
              {/* Image Overlay with Title and Description */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-base mb-2">
                  {images[currentImageIndex].title}
                </h3>
                <p className="text-white/90 text-sm">
                  {images[currentImageIndex].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-primary-foreground w-8"
                  : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
