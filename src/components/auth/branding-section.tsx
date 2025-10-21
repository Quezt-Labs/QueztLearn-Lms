"use client";

import { motion } from "framer-motion";
import { LMSCarousel } from "./lms-carousel";

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface BrandingSectionProps {
  title: string;
  tagline: string;
  carouselImages: CarouselImage[];
}

export function BrandingSection({
  title,
  tagline,
  carouselImages,
}: BrandingSectionProps) {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-foreground/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"></div>
      </div>

      {/* Logo and Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            {title}
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-16">{tagline}</p>

          {/* LMS Carousel */}
          <LMSCarousel images={carouselImages} />
        </motion.div>
      </div>
    </div>
  );
}
