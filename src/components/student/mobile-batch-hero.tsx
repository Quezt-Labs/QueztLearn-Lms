"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Globe, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileBatchHeroProps {
  batch: {
    name: string;
    class: "11" | "12" | "12+" | "Grad";
    exam: string;
    imageUrl?: string;
    language: string;
    startDate: Date | string;
    endDate: Date | string;
    discountPercentage: number;
  };
  isLive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
  isHotDeal: boolean;
  onBack: () => void;
}

export function MobileBatchHero({
  batch,
  isLive,
  isUpcoming,
  isEnded,
  isHotDeal,
  onBack,
}: MobileBatchHeroProps) {
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);

  return (
    <div className="relative bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-white hover:bg-white/20 hover:text-white"
        >
          <span className="mr-2">←</span>
          Back to Explore
        </Button>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl mb-4"
        >
          {batch.imageUrl ? (
            <img
              src={batch.imageUrl}
              alt={batch.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm">
              <GraduationCap className="h-24 w-24 text-white/50" />
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {isLive && (
              <Badge className="bg-emerald-500 text-white border-0 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-white mr-2 animate-pulse" />
                Live Now
              </Badge>
            )}
            {isUpcoming && (
              <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                <Clock className="h-3 w-3 mr-1" />
                Upcoming
              </Badge>
            )}
            {isEnded && (
              <Badge className="bg-gray-500 text-white border-0 shadow-lg">
                Ended
              </Badge>
            )}
            {isHotDeal && (
              <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Hot Deal
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {batch.discountPercentage > 0 && (
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {batch.discountPercentage}% OFF
              </div>
            </div>
          )}
        </motion.div>

        {/* Title & Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Class {batch.class}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              {batch.exam}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {batch.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {startDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {endDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{batch.language}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
